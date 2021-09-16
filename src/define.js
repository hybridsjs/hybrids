import * as cache from "./cache.js";
import { pascalToDash, deferred, camelToDash, walkInShadow } from "./utils.js";

const connect = Symbol("define.connect");
const propsMap = new WeakMap();
const disconnects = new WeakMap();

export const callbacksMap = new WeakMap();

class HybridsRootElement extends HTMLElement {
  constructor() {
    super();

    const props = propsMap.get(this.constructor);

    for (let index = 0; index < props.length; index += 1) {
      const key = props[index];
      if (hasOwnProperty.call(this, key)) {
        const value = this[key];
        delete this[key];
        this[key] = value;
      }
    }

    cache.suspend(this);
  }

  connectedCallback() {
    cache.unsuspend(this);

    const callbacks = callbacksMap.get(this.constructor);
    const list = [];

    for (let index = 0; index < callbacks.length; index += 1) {
      const cb = callbacks[index](this);
      if (cb) list.push(cb);
    }

    disconnects.set(this, list);
  }

  disconnectedCallback() {
    cache.suspend(this);

    const list = disconnects.get(this);
    for (let index = 0; index < list.length; index += 1) {
      list[index]();
    }
  }
}

const transform = {
  string: { from: String, to: String },
  number: { from: Number, to: String },
  boolean: { from: Boolean, to: String },
  array: {
    from: val =>
      Array.isArray(val) ? val : (val && String(val).split(" ")) || [],
    to: val => val.join(" "),
  },
};

function render(fn, useShadow) {
  return {
    value: useShadow
      ? host => {
          const updateDOM = fn(host);
          const target =
            host.shadowRoot ||
            host.attachShadow({
              mode: "open",
              delegatesFocus: fn.delegatesFocus || false,
            });
          return () => {
            updateDOM(host, target);
            return target;
          };
        }
      : host => {
          const updateDOM = fn(host);
          return () => {
            updateDOM(host, host);
            return host;
          };
        },
    observe(host, flush) { flush(); } // prettier-ignore
  };
}

const setter = (host, value) => value;
const supportedOptions = ["value", "writable", "observe", "connect"];
function translate(key, desc) {
  let type = typeof desc;

  if (type === "function") {
    switch (key) {
      case "render":
        return render(desc, true);
      case "content":
        return render(desc);
      default:
        desc = { value: desc };
    }
  } else if (type !== "object" || Array.isArray(desc)) {
    desc = { value: desc };
  } else {
    const descKeys = Object.keys(desc);
    if (descKeys.length === 1 && descKeys[0] === "value") {
      throw TypeError(
        `Not required descriptor form of the '${key}' property - set property value directly`,
      );
    } else {
      const unsupported = descKeys.find(
        prop => !supportedOptions.includes(prop),
      );
      if (unsupported) {
        throw TypeError(
          `Unsupported '${unsupported}' option in the descriptor of the '${key}' property`,
        );
      }
    }
  }

  type = Array.isArray(desc.value) ? "array" : typeof desc.value;

  if (type === "undefined") {
    type = "function";

    desc = {
      ...desc,
      value: setter,
      writable: true,
    };
  }

  const attrName = camelToDash(key);

  if (type === "function") {
    return {
      value: desc.writable
        ? (host, value) => {
            if (value === undefined && host.hasAttribute(attrName)) {
              value = host.getAttribute(attrName);
            }

            return desc.value(host, value);
          }
        : desc.value,
      writable: desc.writable,
      connect: desc.connect,
      observe: desc.observe,
    };
  }

  const fn = transform[type];

  if (!fn) throw TypeError(`Unsupported type for '${key}' property: ${type}`);
  if (type === "array") Object.freeze(desc.value);

  const updateAttr =
    type === "boolean"
      ? (host, value) => {
          if (value) {
            host.setAttribute(attrName, "");
          } else {
            host.removeAttribute(attrName);
          }
        }
      : (host, value) => {
          if (!value && value !== 0) {
            host.removeAttribute(attrName);
          } else {
            host.setAttribute(attrName, fn.to(value));
          }
        };

  return {
    value: (host, value) => {
      if (value === undefined) {
        if (host.hasAttribute(attrName)) {
          return fn.from(type === "boolean" || host.getAttribute(attrName));
        }
        return desc.value;
      }

      return fn.from(value);
    },
    writable: true,
    connect: desc.connect,
    observe: desc.observe
      ? (host, value, lastValue) => {
          updateAttr(host, value);
          desc.observe(host, value, lastValue);
        }
      : updateAttr,
  };
}

function compile(hybrids, lastHybrids) {
  if (hybrids === lastHybrids) return hybrids;

  let HybridsElement = lastHybrids && lastHybrids[connect];
  if (HybridsElement) {
    propsMap.get(HybridsElement).forEach(key => {
      delete HybridsElement.prototype[key];
    });
  } else {
    HybridsElement = class extends HybridsRootElement {};
  }

  hybrids[connect] = HybridsElement;
  Object.freeze(hybrids);

  HybridsElement.hybrids = hybrids;

  const callbacks = [];
  const props = Object.keys(hybrids);

  callbacksMap.set(HybridsElement, callbacks);
  propsMap.set(HybridsElement, props);

  props.forEach(key => {
    if (key === "tag") return;

    const desc = translate(key, hybrids[key]);

    Object.defineProperty(HybridsElement.prototype, key, {
      get: function get() {
        return cache.get(this, key, desc.value);
      },
      set: desc.writable
        ? function set(newValue) {
            cache.set(this, key, setter, newValue);
          }
        : undefined,
      enumerable: true,
      configurable: true,
    });

    if (desc.observe) {
      callbacks.unshift(host =>
        cache.observe(host, key, desc.value, desc.observe),
      );
    }

    if (desc.connect) {
      callbacks.push(host => {
        function invalidate(options) {
          cache.invalidate(host, key, {
            force: typeof options === "object" && options.force === true,
          });
        }
        return desc.connect(host, key, invalidate);
      });
    }
  });

  return HybridsElement;
}

const updateQueue = new Map();
function update(HybridsElement, lastHybrids) {
  if (!updateQueue.size) {
    deferred.then(() => {
      walkInShadow(document.body, node => {
        if (updateQueue.has(node.constructor)) {
          const prevHybrids = updateQueue.get(node.constructor);
          const hybrids = node.constructor.hybrids;
          node.disconnectedCallback();

          Object.keys(hybrids).forEach(key => {
            const type = typeof hybrids[key];
            const clearValue =
              type !== "object" &&
              type !== "function" &&
              hybrids[key] !== prevHybrids[key];
            cache.invalidate(node, key, { clearValue });
          });

          node.connectedCallback();
        }
      });
      updateQueue.clear();
    });
  }
  updateQueue.set(HybridsElement, lastHybrids);
}

function define(hybrids) {
  if (!hybrids.tag) {
    throw TypeError(
      "Error while defining hybrids: 'tag' property with dashed tag name is required",
    );
  }

  const tagName = pascalToDash(hybrids.tag);
  const HybridsElement = window.customElements.get(tagName);

  if (HybridsElement) {
    const lastHybrids = HybridsElement.hybrids;
    if (lastHybrids) {
      update(HybridsElement, lastHybrids);
      return compile(hybrids, lastHybrids);
    }

    throw TypeError(
      `Custom element with '${tagName}' tag name already defined outside of the hybrids context`,
    );
  }

  customElements.define(tagName, compile(hybrids));
  return hybrids;
}

export default Object.freeze(
  Object.assign(define, {
    compile: hybrids => compile(hybrids),
    connect,
  }),
);

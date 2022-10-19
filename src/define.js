import global from "./global.js";
import * as cache from "./cache.js";
import { deferred, camelToDash, walkInShadow } from "./utils.js";

const disconnects = new WeakMap();

class HybridsRootElement extends global.HTMLElement {
  constructor() {
    super();

    for (const key of Object.keys(this)) {
      const value = this[key];
      delete this[key];
      this[key] = value;
    }
  }

  connectedCallback() {
    const { connects } = this.constructor;

    if (connects.size) {
      const set = new Set();
      for (const fn of connects) {
        const cb = fn(this);
        if (cb) set.add(cb);
      }

      disconnects.set(this, set);
    }
  }

  disconnectedCallback() {
    const set = disconnects.get(this);
    if (set) {
      for (const cb of set) cb();
      disconnects.delete(this);
    }
  }
}

function render(fn, useShadow) {
  return {
    get: useShadow
      ? (host) => {
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
      : (host) => {
          const updateDOM = fn(host);
          return () => {
            updateDOM(host, host);
            return host;
          };
        },
    observe(host, flush) {
      flush();
    },
  };
}

const transforms = {
  string: String,
  number: Number,
  boolean: Boolean,
  undefined: (v) => v,
};

function property(key, desc) {
  const type = typeof desc.value;
  const transform = transforms[type];

  if (!transform) {
    throw TypeError(
      `Invalid default value for '${key}' property - it must be a string, number, boolean or undefined: ${type}`,
    );
  }

  const defaultValue = desc.value;
  const attrName = camelToDash(key);

  const setAttr = (host, value) => {
    if (
      (!value && value !== 0) ||
      (typeof value === "object" && value.toString() === undefined)
    ) {
      host.removeAttribute(attrName);
    } else {
      host.setAttribute(attrName, type === "boolean" ? "" : value);
    }
    return value;
  };

  return {
    get: (host, value) => {
      if (value === undefined) {
        if (host.hasAttribute(attrName)) {
          value = transform(type === "boolean" || host.getAttribute(attrName));
        } else {
          return defaultValue;
        }
      }
      return value;
    },
    set:
      type !== "undefined"
        ? (host, value) => setAttr(host, transform(value))
        : (host, value) => value,
    connect:
      type !== "undefined"
        ? (host, _, invalidate) => {
            if (!host.hasAttribute(attrName) && host[key] === defaultValue) {
              setAttr(host, defaultValue);
            }

            return desc.connect && desc.connect(host, _, invalidate);
          }
        : desc.connect,
    observe: desc.observe,
  };
}

function compile(hybrids, HybridsElement) {
  if (HybridsElement) {
    if (hybrids === HybridsElement.hybrids) return HybridsElement;

    for (const key of Object.keys(HybridsElement.hybrids)) {
      delete HybridsElement.prototype[key];
    }
  } else {
    HybridsElement = class extends HybridsRootElement {};
  }

  HybridsElement.hybrids = hybrids;
  const connects = new Set();

  for (const key of Object.keys(hybrids)) {
    if (key === "tag") continue;

    let desc = hybrids[key];
    const type = typeof desc;

    if (type === "function") {
      if (key === "render") {
        desc = render(desc, true);
      } else if (key === "content") {
        desc = render(desc);
      } else {
        desc = { get: desc };
      }
    } else if (type !== "object" || desc === null) {
      desc = { value: desc };
    } else if (desc.set) {
      const attrName = camelToDash(key);
      const get = desc.get || ((host, value) => value);
      desc.get = (host, value) => {
        if (value === undefined) {
          value = desc.set(host, host.getAttribute(attrName) || value);
        }
        return get(host, value);
      };
    }

    if (hasOwnProperty.call(desc, "value")) {
      desc = property(key, desc);
    } else if (!desc.get) {
      throw TypeError(
        `Invalid descriptor for '${key}' property - it must contain 'value' or 'get' option`,
      );
    }

    Object.defineProperty(HybridsElement.prototype, key, {
      get: function get() {
        return cache.get(this, key, desc.get);
      },
      set:
        desc.set &&
        function set(newValue) {
          cache.set(this, key, desc.set, newValue);
        },
      enumerable: true,
      configurable: true,
    });

    if (desc.connect) {
      connects.add((host) => {
        function invalidate(options) {
          cache.invalidate(host, key, {
            force: typeof options === "object" && options.force === true,
          });
        }
        return desc.connect(host, key, invalidate);
      });
    }

    if (desc.observe) {
      connects.add((host) => cache.observe(host, key, desc.get, desc.observe));
    }
  }

  HybridsElement.connects = connects;

  return HybridsElement;
}

const updateQueue = new Map();
function update(HybridsElement) {
  if (!updateQueue.size) {
    deferred.then(() => {
      walkInShadow(global.document.body, (node) => {
        if (updateQueue.has(node.constructor)) {
          const prevHybrids = updateQueue.get(node.constructor);
          const hybrids = node.constructor.hybrids;
          node.disconnectedCallback();

          for (const key of Object.keys(hybrids)) {
            const type = typeof hybrids[key];
            const clearValue =
              type !== "object" &&
              type !== "function" &&
              hybrids[key] !== prevHybrids[key];
            cache.invalidate(node, key, { clearValue });
          }

          node.connectedCallback();
        }
      });
      updateQueue.clear();
    });
  }
  updateQueue.set(HybridsElement, HybridsElement.hybrids);
}

function define(hybrids) {
  if (!hybrids.tag) {
    throw TypeError(
      "Error while defining hybrids: 'tag' property with dashed tag name is required",
    );
  }

  const HybridsElement = global.customElements.get(hybrids.tag);

  if (HybridsElement) {
    if (HybridsElement.hybrids) {
      update(HybridsElement);
      compile(hybrids, HybridsElement);

      return Object.freeze(hybrids);
    }

    throw TypeError(
      `Custom element with '${hybrids.tag}' tag name already defined outside of the hybrids context`,
    );
  }

  global.customElements.define(hybrids.tag, compile(hybrids));
  return Object.freeze(hybrids);
}

export default Object.freeze(
  Object.assign(define, { compile: (hybrids) => compile(hybrids) }),
);

import * as cache from "./cache.js";
import { pascalToDash, deferred, camelToDash } from "./utils.js";

const defaultMethod = (host, value) => value;

export const callbacksMap = new WeakMap();
const propsMap = new WeakMap();

function translate(key, desc) {
  let type = typeof desc;

  if (type === "function") {
    switch (key) {
      case "render":
        return {
          get: host => {
            const updateDOM = desc(host);
            const target =
              host.shadowRoot ||
              host.attachShadow({
                mode: desc.mode || "open",
                delegatesFocus: desc.delegatesFocus || false,
              });
            return () => {
              updateDOM(host, target);
              return target;
            };
          },
          observe(host, flush) { flush(); } // prettier-ignore
        };
      case "content":
        return {
          get: host => {
            const updateDOM = desc(host);
            return function flush() {
              updateDOM(host);
              return host;
            };
          },
          observe(host, flush) { flush(); } // prettier-ignore
        };
      default:
        return { get: desc };
    }
  }

  if (type !== "object" || desc === null || Array.isArray(desc)) {
    desc = { get: desc !== undefined ? desc : defaultMethod };
  }

  type = typeof desc.get;
  if (type !== "function") {
    let fn;

    switch (type) {
      case "string":
        fn = String;
        break;
      case "number":
        fn = Number;
        break;
      case "boolean":
        fn = Boolean;
        break;
      case "object":
        if (desc.get) Object.freeze(desc.get);
        fn = value => {
          if (typeof value !== "object") {
            throw TypeError(
              `Assigned value must be an object: ${typeof value}`,
            );
          }
          return value && Object.freeze(value);
        };
        break;
      default:
        fn = v => v;
    }

    return {
      ...desc,
      get: (host, value) => fn(value !== undefined ? value : desc),
      type,
    };
  }

  return { ...desc };
}

function compile(Hybrid, hybrids, omitProps = []) {
  Hybrid.hybrids = hybrids;

  const callbacks = [];
  const props = Object.keys(hybrids).filter(key => !omitProps.includes(key));

  callbacksMap.set(Hybrid, callbacks);
  propsMap.set(Hybrid, props);

  props.forEach(key => {
    const desc = translate(key, hybrids[key]);
    const writable = desc.get.length > 1;

    Object.defineProperty(Hybrid.prototype, key, {
      get: function get() {
        return cache.get(this, key, desc.get);
      },
      set: writable
        ? function set(newValue) {
            cache.set(this, key, defaultMethod, newValue);
          }
        : undefined,
      enumerable: true,
      configurable: true,
    });

    if (writable) {
      const connect = desc.connect;
      const initialized = new WeakSet();
      const attrName = camelToDash(key);

      desc.connect = (host, _, invalidate) => {
        if (!initialized.has(host)) {
          initialized.add(host);

          if (host.hasAttribute(attrName)) {
            const attrValue = host.getAttribute(attrName);
            host[key] =
              attrValue === "" && desc.type === "boolean" ? true : attrValue;
          }
        }

        return connect && connect(host, _, invalidate);
      };

      if (desc.type !== "undefined") {
        const observe = desc.observe;
        desc.observe = (host, value, lastValue) => {
          const attrValue = value === true ? "" : value;

          if (!value && value !== 0) {
            host.removeAttribute(attrName);
          } else {
            host.setAttribute(attrName, attrValue);
          }

          if (observe) observe(host, value, lastValue);
        };
      }
    }

    if (desc.observe) {
      callbacks.unshift(host =>
        cache.observe(host, key, desc.get, desc.observe),
      );
    }

    if (desc.connect) {
      callbacks.push(host =>
        desc.connect(host, key, options => {
          cache.invalidate(host, key, {
            force: options && options.force === true,
          });
        }),
      );
    }
  });
}

function walkInShadow(node, fn) {
  fn(node);

  Array.from(node.children).forEach(el => walkInShadow(el, fn));

  if (node.shadowRoot) {
    Array.from(node.shadowRoot.children).forEach(el => walkInShadow(el, fn));
  }
}

const updateQueue = new Map();
function update(Hybrid, lastHybrids) {
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
  updateQueue.set(Hybrid, lastHybrids);
}

const disconnects = new WeakMap();

export function defineElement(tagName, hybrids, omitProps) {
  const type = typeof hybrids;
  if (!hybrids || type !== "object") {
    throw TypeError(`Second argument must be an object: ${type}`);
  }

  if (tagName !== null) {
    const CustomElement = window.customElements.get(tagName);

    if (CustomElement) {
      if (CustomElement.hybrids === hybrids) {
        return CustomElement;
      }
      if (CustomElement.hybrids) {
        Object.keys(CustomElement.hybrids).forEach(key => {
          delete CustomElement.prototype[key];
        });

        const lastHybrids = CustomElement.hybrids;

        compile(CustomElement, hybrids, omitProps);
        update(CustomElement, lastHybrids);

        return CustomElement;
      }

      return window.customElements.define(tagName, HTMLElement);
    }
  }

  class Hybrid extends HTMLElement {
    constructor() {
      super();

      const props = propsMap.get(Hybrid);

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

      const callbacks = callbacksMap.get(Hybrid);
      const list = [];

      for (let index = 0; index < callbacks.length; index += 1) {
        const cb = callbacks[index](this);
        if (cb) list.push(cb);
      }

      disconnects.set(this, list);
    }

    disconnectedCallback() {
      const list = disconnects.get(this);
      for (let index = 0; index < list.length; index += 1) {
        list[index]();
      }

      cache.suspend(this);
    }
  }

  compile(Hybrid, hybrids, omitProps);

  if (tagName !== null) {
    Object.defineProperty(Hybrid, "name", {
      get: () => tagName,
    });
    customElements.define(tagName, Hybrid);
  }

  return Hybrid;
}

function defineTagged(elements) {
  elements.forEach(hybrids => {
    if (typeof hybrids.tag !== "string") {
      throw TypeError(
        `Tagged element 'tag' property must be a string: ${hybrids.tag}`,
      );
    }

    defineElement(pascalToDash(hybrids.tag), hybrids, ["tag"]);
  }, {});

  return elements.length === 1 ? elements[0] : elements;
}

export default function define(...args) {
  if (typeof args[0] === "object" && args[0] !== null) {
    return defineTagged(args);
  }

  return defineElement(...args);
}

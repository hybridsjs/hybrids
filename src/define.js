import property from "./property.js";
import render from "./render.js";

import * as cache from "./cache.js";
import { pascalToDash, deferred } from "./utils.js";

const defaultMethod = (host, value) => value;

export const callbacksMap = new WeakMap();
const propsMap = new WeakMap();

function translate(key, desc) {
  const type = typeof desc;

  let config;

  if (type === "function") {
    switch (key) {
      case "render":
        config = render(desc);
        break;
      case "content":
        config = render(desc, { shadowRoot: false });
        break;
      default:
        config = { get: desc };
    }
  } else if (type !== "object" || desc === null || Array.isArray(desc)) {
    config = property(desc);
  } else {
    config = {
      get: desc.get || defaultMethod,
      set: desc.set || (!desc.get && defaultMethod) || undefined,
      connect: desc.connect,
      observe: desc.observe,
    };
  }

  return config;
}

function compile(Hybrid, hybrids, omitProps = []) {
  Hybrid.hybrids = hybrids;

  const callbacks = [];
  const props = Object.keys(hybrids).filter(key => !omitProps.includes(key));

  callbacksMap.set(Hybrid, callbacks);
  propsMap.set(Hybrid, props);

  props.forEach(key => {
    const config = translate(key, hybrids[key]);

    Object.defineProperty(Hybrid.prototype, key, {
      get: function get() {
        return cache.get(this, key, config.get);
      },
      set:
        config.set &&
        function set(newValue) {
          cache.set(this, key, config.set, newValue);
        },
      enumerable: true,
      configurable: true,
    });

    if (config.observe) {
      callbacks.unshift(host =>
        cache.observe(host, key, config.get, config.observe),
      );
    }

    if (config.connect) {
      callbacks.push(host =>
        config.connect(host, key, options => {
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

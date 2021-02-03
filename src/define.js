import property from "./property.js";
import render from "./render.js";

import * as cache from "./cache.js";
import { pascalToDash, deferred } from "./utils.js";

const defaultMethod = (host, value) => value;

const callbacksMap = new WeakMap();
const propsMap = new WeakMap();

function compile(Hybrid, descriptors) {
  Hybrid.hybrids = descriptors;

  const callbacks = [];
  const props = Object.keys(descriptors);

  callbacksMap.set(Hybrid, callbacks);
  propsMap.set(Hybrid, props);

  props.forEach(key => {
    const desc = descriptors[key];
    const type = typeof desc;

    let config;

    if (type === "function") {
      config = key === "render" ? render(desc) : { get: desc };
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
        config.connect(host, key, () => {
          cache.invalidate(host, key);
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
          const hybrids = updateQueue.get(node.constructor);
          node.disconnectedCallback();

          Object.keys(node.constructor.hybrids).forEach(key => {
            cache.invalidate(
              node,
              key,
              node.constructor.hybrids[key] !== hybrids[key],
            );
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

function defineElement(tagName, hybridsOrConstructor) {
  const type = typeof hybridsOrConstructor;
  if (!hybridsOrConstructor || (type !== "object" && type !== "function")) {
    throw TypeError(`Second argument must be an object or a function: ${type}`);
  }

  if (tagName !== null) {
    const CustomElement = window.customElements.get(tagName);

    if (type === "function") {
      if (CustomElement !== hybridsOrConstructor) {
        return window.customElements.define(tagName, hybridsOrConstructor);
      }
      return CustomElement;
    }

    if (CustomElement) {
      if (CustomElement.hybrids === hybridsOrConstructor) {
        return CustomElement;
      }
      if (CustomElement.hybrids) {
        Object.keys(CustomElement.hybrids).forEach(key => {
          delete CustomElement.prototype[key];
        });

        const lastHybrids = CustomElement.hybrids;

        compile(CustomElement, hybridsOrConstructor);
        update(CustomElement, lastHybrids);

        return CustomElement;
      }

      return window.customElements.define(tagName, hybridsOrConstructor);
    }
  }

  class Hybrid extends HTMLElement {
    constructor() {
      super();

      const props = propsMap.get(Hybrid);

      for (let index = 0; index < props.length; index += 1) {
        const key = props[index];
        if (Object.prototype.hasOwnProperty.call(this, key)) {
          const value = this[key];
          delete this[key];
          this[key] = value;
        }
      }
    }

    connectedCallback() {
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
    }
  }

  compile(Hybrid, hybridsOrConstructor);

  if (tagName !== null) {
    Object.defineProperty(Hybrid, "name", {
      get: () => tagName,
    });
    customElements.define(tagName, Hybrid);
  }

  return Hybrid;
}

function defineMap(elements) {
  return Object.keys(elements).reduce((acc, key) => {
    const tagName = pascalToDash(key);
    acc[key] = defineElement(tagName, elements[key]);

    return acc;
  }, {});
}

export default function define(...args) {
  if (typeof args[0] === "object" && args[0] !== null) {
    return defineMap(args[0]);
  }

  return defineElement(...args);
}

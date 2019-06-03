import property from './property';
import render from './render';

import * as cache from './cache';
import { pascalToDash, deferred } from './utils';

/* istanbul ignore next */
try { process.env.NODE_ENV } catch(e) { var process = { env: { NODE_ENV: 'production' } }; } // eslint-disable-line

const defaultMethod = (host, value) => value;

function compile(Hybrid, descriptors) {
  Hybrid.hybrids = descriptors;
  Hybrid.callbacks = [];

  Object.keys(descriptors).forEach((key) => {
    const desc = descriptors[key];
    const type = typeof desc;

    let config;

    if (type === 'function') {
      config = key === 'render' ? render(desc) : { get: desc };
    } else if (type !== 'object' || desc === null || (Array.isArray(desc))) {
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
      set: config.set && function set(newValue) {
        cache.set(this, key, config.set, newValue);
      },
      enumerable: true,
      configurable: process.env.NODE_ENV !== 'production',
    });

    if (config.connect) {
      Hybrid.callbacks.push(host => config.connect(host, key, () => {
        cache.invalidate(host, key);
      }));
    }

    if (config.observe) {
      Hybrid.callbacks.push((host) => {
        let lastValue;
        return cache.observe(host, key, () => {
          const value = host[key];
          if (value !== lastValue) {
            config.observe(host, value, lastValue);
            lastValue = value;
          }
        });
      });
    }
  });
}

let update;
/* istanbul ignore else */
if (process.env.NODE_ENV !== 'production') {
  const walkInShadow = (node, fn) => {
    fn(node);

    Array.from(node.children)
      .forEach(el => walkInShadow(el, fn));

    if (node.shadowRoot) {
      Array.from(node.shadowRoot.children)
        .forEach(el => walkInShadow(el, fn));
    }
  };

  const updateQueue = new Map();
  update = (Hybrid, lastHybrids) => {
    if (!updateQueue.size) {
      deferred.then(() => {
        walkInShadow(document.body, (node) => {
          if (updateQueue.has(node.constructor)) {
            const hybrids = updateQueue.get(node.constructor);
            node.disconnectedCallback();

            Object.keys(node.constructor.hybrids).forEach((key) => {
              cache.invalidate(node, key, node[key] === hybrids[key]);
            });

            node.connectedCallback();
          }
        });
        updateQueue.clear();
      });
    }
    updateQueue.set(Hybrid, lastHybrids);
  };
}

const disconnects = new WeakMap();

function defineElement(tagName, hybridsOrConstructor) {
  const type = typeof hybridsOrConstructor;
  if (type !== 'object' && type !== 'function') {
    throw TypeError(`Second argument must be an object or a function: ${type}`);
  }

  const CustomElement = window.customElements.get(tagName);

  if (type === 'function') {
    if (CustomElement !== hybridsOrConstructor) {
      return window.customElements.define(tagName, hybridsOrConstructor);
    }
    return CustomElement;
  }

  if (CustomElement) {
    if (CustomElement.hybrids === hybridsOrConstructor) {
      return CustomElement;
    }
    if (process.env.NODE_ENV !== 'production' && CustomElement.hybrids) {
      Object.keys(CustomElement.hybrids).forEach((key) => {
        delete CustomElement.prototype[key];
      });

      const lastHybrids = CustomElement.hybrids;

      compile(CustomElement, hybridsOrConstructor);
      update(CustomElement, lastHybrids);

      return CustomElement;
    }

    throw Error(`Element '${tagName}' already defined`);
  }

  class Hybrid extends HTMLElement {
    static get name() { return tagName; }

    connectedCallback() {
      const { callbacks } = this.constructor;
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
  customElements.define(tagName, Hybrid);

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
  if (typeof args[0] === 'object') {
    return defineMap(args[0]);
  }

  return defineElement(...args);
}

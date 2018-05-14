
import property from './property';
import render from './render';

import * as cache from './cache';
import { dispatch } from './utils';

function dispatchInvalidate(host) {
  dispatch(host, '@invalidate', { bubbles: true, composed: true });
}

const defaultGet = (host, value) => value;

function compile(Hybrid, hybrids) {
  Hybrid.hybrids = hybrids;
  Hybrid.connects = [];

  Object.keys(hybrids).forEach((key) => {
    let config = hybrids[key];
    const type = typeof config;

    if (key === 'render') {
      config = render(config);
    } else if (type === 'function') {
      config = { get: config };
    } else if (config === null || type !== 'object' || (type === 'object' && !config.get && !config.set)) {
      config = property(config);
    }

    config.get = config.get || defaultGet;

    Object.defineProperty(Hybrid.prototype, key, {
      get: function get() {
        return cache.get(this, key, config.get);
      },
      set: config.set && function set(newValue) {
        cache.set(this, key, config.set, newValue, () => dispatchInvalidate(this));
      },
      enumerable: true,
      configurable: process.env.NODE_ENV !== 'production',
    });

    if (config.connect) {
      Hybrid.connects.push(host => config.connect(host, key, (clearCache = true) => {
        if (clearCache) cache.invalidate(host, key);
        dispatchInvalidate(host);
      }));
    }
  });
}

let update;
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

  update = (Hybrid) => {
    walkInShadow(document.body, (node) => {
      if (node.constructor === Hybrid) {
        node.disconnectedCallback();

        Object.keys(node.constructor.hybrids).forEach((key) => {
          cache.invalidate(node, key);
        });

        node.connectedCallback();
        dispatchInvalidate(node);
      }
    });
  };
}

// BUG: Babel v6 transpiled class breaks native custom elements
export function HTMLBridge(...args) {
  return Reflect.construct(HTMLElement, args, this.constructor);
}
Object.setPrototypeOf(HTMLBridge.prototype, HTMLElement.prototype);

const connects = new WeakMap();

export default function define(tagName, hybrids) {
  const CustomElement = window.customElements.get(tagName);

  if (CustomElement) {
    if (CustomElement.hybrids === hybrids) {
      return CustomElement;
    } else if (process.env.NODE_ENV !== 'production' && CustomElement.hybrids) {
      Object.keys(CustomElement.hybrids).forEach((key) => {
        delete CustomElement.prototype[key];
      });

      compile(CustomElement, hybrids);
      update(CustomElement);

      return CustomElement;
    }

    throw Error(`[define] Element '${tagName}' already defined`);
  }

  class Hybrid extends HTMLBridge {
    static get name() { return tagName; }

    connectedCallback() {
      const list = this.constructor.connects.reduce((acc, fn) => {
        const result = fn(this);
        if (result) acc.add(result);
        return acc;
      }, new Set());

      connects.set(this, list);
      dispatchInvalidate(this);
    }

    disconnectedCallback() {
      const list = connects.get(this);
      list.forEach(fn => fn());
    }
  }

  compile(Hybrid, hybrids);
  customElements.define(tagName, Hybrid);

  return Hybrid;
}

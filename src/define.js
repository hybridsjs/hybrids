import property from './property';
import render from './render';

import * as cache from './cache';
import { dispatch, pascalToDash } from './utils';

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

    if (type === 'function') {
      config = key === 'render' ? render(config) : { get: config };
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

  const updateQueue = new Map();
  update = (Hybrid, lastHybrids) => {
    if (!updateQueue.size) {
      Promise.resolve().then(() => {
        walkInShadow(document.body, (node) => {
          if (updateQueue.has(node.constructor)) {
            const hybrids = updateQueue.get(node.constructor);
            node.disconnectedCallback();

            Object.keys(node.constructor.hybrids).forEach((key) => {
              cache.invalidate(node, key, node[key] === hybrids[key]);
            });

            node.connectedCallback();
            dispatchInvalidate(node);
          }
        });
        updateQueue.clear();
      });
    }
    updateQueue.set(Hybrid, lastHybrids);
  };
}

const connects = new WeakMap();

function defineElement(tagName, hybridsOrConstructor) {
  const type = typeof hybridsOrConstructor;
  if (type !== 'object' && type !== 'function') {
    throw TypeError('[define] Invalid second argument. It must be an object or a function');
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

    throw Error(`[define] Element '${tagName}' already defined`);
  }

  class Hybrid extends HTMLElement {
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

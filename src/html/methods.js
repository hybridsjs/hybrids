import defineElement from '../define';
import { pascalToDash } from '../utils';

const queue = new Map();

export function define(elements) {
  if (!queue.size) {
    Promise.resolve().then(() => {
      queue.forEach((hybrids, tagName) => defineElement(tagName, hybrids));
      queue.clear();
    });
  }

  Object.keys(elements).forEach((name) => {
    const type = typeof elements[name];
    if (type !== 'object' && type !== 'function') {
      throw TypeError(`[html] '${name}' key must be an object or a function`);
    }

    const tagName = pascalToDash(name);

    if (type === 'function') {
      const CustomElement = window.customElements.get(tagName);
      if (!CustomElement) {
        window.customElements.define(tagName, elements[name]);
      } else if (CustomElement !== elements[name]) {
        throw Error(`[html] Element '${tagName}' already defined`);
      }
    } else {
      const item = queue.get(tagName);

      if (!item) {
        queue.set(tagName, elements[name]);
      } else if (item !== elements[name]) {
        throw Error(`[html] Duplicated <${tagName}> tag name for the definition in '${name}' key`);
      }
    }
  });

  return this;
}

export function key(id) {
  this.id = id;
  return this;
}

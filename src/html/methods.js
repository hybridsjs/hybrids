import defineElement from '../define';
import { pascalToDash } from '../utils';

export function define(elements) {
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
      defineElement(tagName, elements[name]);
    }
  });

  return this;
}

export function key(id) {
  this.id = id;
  return this;
}

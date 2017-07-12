import HTMLWrapper from './wrapper';
import { pascalToDash } from './utils';
import template from './template';

export default function define(elements) {
  Object.entries(elements)
    .map(([name, Component]) => ([name, pascalToDash(name), Component]))
    .filter(([, tagName, Component]) => {
      const CustomElement = global.customElements.get(tagName);
      if (CustomElement) {
        if (CustomElement.Component === Component) return false;
        throw Error(`Element '${tagName}' already defined`);
      }

      return true;
    })
    .forEach(([name, tagName, Component]) => {
      const config = Component.component;
      const attrs = [];
      const className = `HTML${name}Element`;
      const plugins = [];

      class Wrapper extends HTMLWrapper {
        static get observedAttributes() { return attrs; }

        static get Component() { return Component; }
        static get plugins() { return plugins; }

        static get name() { return className; }
      }

      if (config) {
        if (config.define) define(config.define);

        Object.entries(config.bindings || {}).forEach(([key, fn]) => {
          fn = fn(key, Wrapper, Component);
          if (fn) plugins.push(fn);
        });

        if (config.template) {
          plugins.push(template({ ...config, is: tagName }));
        }
      }

      customElements.define(tagName, Wrapper);
      Object.defineProperty(global, className, { value: Wrapper });
    });
}

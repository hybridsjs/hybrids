import Hybrid from './hybrid';
import Template from './template/template';
import bootstrap from './bootstrap';
import { pascalToDash } from './utils';
import { COMPONENT } from './symbols';

const defaultStyles = [''];

export default function define(tagName, Component) {
  const CustomElement = global.customElements.get(tagName);
  if (CustomElement) {
    if (CustomElement.Component === Component) {
      return CustomElement;
    }
    throw Error(`Element '${tagName}' already defined`);
  }

  const attrs = [];
  const plugins = [];
  const view = Component.view;
  let template;

  if (view) {
    if (view.define) {
      Object.entries(view.define).forEach(([name, ViewComponent]) => {
        define(pascalToDash(name), ViewComponent);
      });
    }
    template = new Template(view.template, {
      markers: view.markers,
      filters: view.filters,
      styles: view.styles ? defaultStyles.concat(view.styles) : defaultStyles,
      name: tagName,
    });
  }

  class ExtHybrid extends Hybrid {
    static get Component() { return Component; }
    static get observedAttributes() { return attrs; }
    static get name() { return tagName; }

    connectedCallback() {
      if (!this[COMPONENT]) {
        Object.defineProperty(this, COMPONENT, {
          value: bootstrap({
            host: this,
            Component,
            template,
            plugins,
          }),
        });
      }

      super.connectedCallback();
    }
  }

  Object.entries(Component.plugins || {}).forEach(([key, plugin]) => {
    const fn = plugin(key, ExtHybrid, Component);
    if (fn) plugins.push(fn);
  });

  customElements.define(tagName, ExtHybrid);

  return ExtHybrid;
}

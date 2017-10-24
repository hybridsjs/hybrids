import Hybrid from './hybrid';
import Template from './template/template';
import bootstrap from './bootstrap';
import { pascalToDash } from './utils';
import { COMPONENT } from './symbols';

export default function define(elements) {
  Object.entries(elements)
    .map(([name, Component]) => ([name, pascalToDash(name), Component]))
    .forEach(([name, tagName, Component]) => {
      const CustomElement = global.customElements.get(tagName);
      if (CustomElement) {
        if (CustomElement.Component === Component) return;
        throw Error(`Element '${tagName}' already defined`);
      }

      const attrs = [];
      const className = `HTML${name}Element`;
      const plugins = [];
      const view = Component.view;
      let template;

      if (view) {
        if (view.define) define(view.define);
        template = new Template(view.template, {
          markers: view.markers,
          filters: view.filters,
          styles: view.styles,
          name: tagName,
        });
      }

      class ExtHybrid extends Hybrid {
        static get Component() { return Component; }
        static get observedAttributes() { return attrs; }
        static get name() { return className; }

        constructor() {
          super();

          Object.defineProperty(this, COMPONENT, {
            value: bootstrap({
              host: this,
              Component,
              template,
              plugins,
            }),
          });
        }
      }

      Object.entries(Component.plugins || {}).forEach(([key, plugin]) => {
        const fn = plugin(key, ExtHybrid, Component);
        if (fn) plugins.push([key, fn]);
      });


      customElements.define(tagName, ExtHybrid);
      Object.defineProperty(global, className, { value: ExtHybrid });
    });
}

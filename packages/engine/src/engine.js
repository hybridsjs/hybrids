import { State, PropertyObserver } from 'papillon';
import { OPTIONS, CONTROLLER, NAME } from '@hybrids/core';
import { shedule } from '@hybrids/core/src/utils';

import { error } from './debug';
import Template from './template';
import markers from './markers';
import filters from './filters';

class Engine {
  constructor(element, template) {
    this.element = element;
    this.controller = this.element[CONTROLLER];
    this.template = template;
    this.update = this.update.bind(this);

    Object.keys(this.controller).forEach((key) => {
      new PropertyObserver(this.controller, key).observe(
        (value) => { if (State.isObject(value)) shedule(this.update); },
        () => shedule(this.update)
      );
    });

    // BUG: https://github.com/webcomponents/custom-elements/issues/17
    Promise.resolve().then(() => {
      this.shadowRoot = this.element.shadowRoot || this.element.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(this.compile());
    }).catch((e) => { throw e; });
  }

  update() {
    this.template.run(this.shadowRoot, (w) => {
      const value = w.expr.get();

      if (State.isObject(value)) {
        const state = new State(value);

        if (state.isChanged()) {
          w.fn({ changelog: state.changelog, type: 'modify' }, this);
        } else if (!State.is(value, w.cache)) {
          w.fn({ type: 'set' }, this);
        }
      } else if (!{}.hasOwnProperty.call(w, 'cache') || !State.is(value, w.cache)) {
        w.fn({ type: 'set', oldValue: w.cache }, this);
      }

      w.cache = value;
    });

    if (window.ShadyCSS) window.ShadyCSS.applyStyle(this.element);
  }

  compile(templateId, locals) {
    return this.template.compile(this.controller, templateId, locals);
  }
}

export default function engine(Hybrid) {
  const options = Hybrid[OPTIONS];
  if (!options.template) error(TypeError, 'engine: Hybrid "template" option is required');

  const template = new Template(options.template, {
    markers: Object.assign({}, markers, options.markers),
    filters: Object.assign({}, filters, options.filters),
    name: Hybrid[NAME],
    styles: options.styles
  });

  return element => new Engine(element, template);
}

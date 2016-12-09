import { State } from 'papillon/papillon';
import { OPTIONS, CONTROLLER } from '@hybrids/core';

import Template from './template';
import markers from './markers';
import filters from './filters';

class Engine {
  constructor(element, template) {
    this.element = element;
    this.template = template;
  }

  compile(templateId, locals) {
    return this.template.compile(this.element[CONTROLLER], templateId, locals);
  }

  connected() {
    this.shadowRoot = this.element.shadowRoot || this.element.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.compile());

    this.changed();
  }

  changed(changelog) {
    this.template.run(this.shadowRoot, (w) => {
      if (w.locals) {
        const cache = w.cache;
        const value = w.expr.get();
        if (typeof cache === 'object' && cache !== null) {
          const state = new State(cache);
          if (state.isChanged()) {
            w.fn({
              changelog: state.changelog,
              type: cache === value ? 'modify' : 'set'
            }, this);
          }
        } else if (cache !== value) {
          w.fn({ type: 'set' }, this);
        }
        w.cache = value;
      } else if (!changelog || changelog[w.rootProperty] || !w.initialized) {
        w.initialized = true;
        w.fn((changelog && changelog[w.rootProperty]) || { type: 'set' }, this);
      }
    });
  }

  disconnected() {
    Array.from(this.shadowRoot.childNodes).forEach(child => this.shadowRoot.removeChild(child));
  }
}

export default function engine(Hybrid) {
  const options = Hybrid[OPTIONS];

  if (options.template) {
    const template = new Template(
      options.template,
      Object.assign({}, markers, options.markers),
      Object.assign({}, filters, options.filters),
    );

    return element => new Engine(element, template);
  }

  return false;
}

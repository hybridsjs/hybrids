import { State } from 'papillon/papillon';
import { OPTIONS, CONTROLLER } from '@hybrids/core';

import Template from './template';
import markers from './markers';
import filters from './filters';

class Engine {
  constructor(element, template) {
    this.controller = element[CONTROLLER];
    this.template = template;

    this.shadowRoot = element.shadowRoot || element.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.compile());

    this.shadowRoot.addEventListener('hybrids:change', (event) => {
      if (event.currentTarget === event.target) {
        this.render(event.detail.changelog);
      }
    });
  }

  compile(templateId, locals) {
    return this.template.compile(this.controller, templateId, locals);
  }

  render(changelog) {
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

  connected() {
    this.render();
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

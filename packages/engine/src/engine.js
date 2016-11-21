import { Observer, State } from 'papillon/papillon';
import { dispatchEvent, OPTIONS, CONTROLLER } from '@hybrids/core';

import Template from './template';
import markers from './markers';
import filters from './filters';

class Engine {
  constructor(element, template) {
    this.element = element;
    this.controller = element[CONTROLLER];
    this.template = template;
    this.observedProperties = element.constructor[OPTIONS].properties
      .reduce((acc, { property }) => { acc[property] = true; return acc; }, {});

    this.shadowRoot = this.element.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(this.compile());
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
    this.observer = new Observer(this.controller, Object.keys(this.controller), (changelog) => {
      this.render(changelog);

      const shouldEmit = Object.keys(changelog)
        .filter(key => changelog[key].type === 'modify')
        .some(key => this.observedProperties[key]);

      if (shouldEmit) dispatchEvent.source.call(this.element, 'change');
    });

    this.shadowRoot.addEventListener('change', () => {
      this.observer.check();
    });

    this.render();
  }

  diconnected() {
    this.observer.destroy();
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

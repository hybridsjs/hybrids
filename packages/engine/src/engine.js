import { State, PropertyObserver } from 'papillon';

import { error } from './debug';
import Template from './template';
import markers from './markers';
import filters from './filters';

function execute(host, template, compile) {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      template.run(host.shadowRoot, (w) => {
        const value = w.expr.get();
        let changelog;

        if (State.isObject(value)) {
          const state = new State(value);

          if (state.isChanged()) {
            changelog = { type: 'modify', changelog: state.changelog };
          } else if (!State.is(value, w.cache)) {
            changelog = { type: 'set' };
          }
        } else if (!{}.hasOwnProperty.call(w, 'cache') || !State.is(value, w.cache)) {
          changelog = { type: 'set', oldValue: w.cache };
        }

        if (changelog) w.fn(value, changelog, compile);
        w.cache = value;
      });

      if (window.ShadyCSS) window.ShadyCSS.applyStyle(host);
      resolve();
    });
  });
}

export default function engine(options) {
  if (process.env.NODE_ENV !== 'production' && !options.template) {
    error(TypeError, 'engine: Hybrid "template" option is required');
  }

  const template = new Template(options.template, {
    markers: Object.assign({}, markers, options.markers),
    filters: Object.assign({}, filters, options.filters),
    styles: options.styles,
    name: options.name,
  });

  const globalKeys = template.getRootPathProperties();
  options.properties.forEach(({ property }) => globalKeys.add(property));

  return (host, ctrl) => {
    const keys = new Set([...globalKeys, Object.keys(ctrl)]);
    const compile = (id, locals) => template.compile(ctrl, id, locals);

    let request;
    const render = () => {
      request = request || execute(host, template, compile).then(() => (request = undefined));
    };

    keys.forEach((key) => {
      new PropertyObserver(ctrl, key).observe(
          value => (value && typeof value === 'object' ? render() : null),
          render
        );
    });

    host.addEventListener('hybrid-update', render);

    requestAnimationFrame(() => {
      const shadowRoot = host.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(compile());
    });

    render();
  };
}

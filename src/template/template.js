import { State } from 'papillon';
import Path from './path';
import Expression, { setNodeContext } from './expression';
import {
  getTemplateId,
  parseTemplate,
  walk,
  stringifyMarker,
} from './parser';

const WATCHERS = Symbol('watchers');

export default class Template {
  constructor(input, { markers = {}, filters = {}, name, styles } = {}) {
    this.markers = markers;
    this.filters = filters;
    this.compile = this.compile.bind(this);

    if (typeof input === 'object') {
      if (input.nodeName === 'TEMPLATE') {
        input = input.innerHTML;
      } else {
        this.container = {
          p: Object.keys(input.p).reduce((acc, key) => {
            acc[key] = new Path(input.p[key]);
            return acc;
          }, {}),
          t: input.t.map((t, index) => {
            if (!index && styles) {
              [].concat(styles).forEach((style) => { t.e = `<style>${style}</style>${t.e}`; });
            }

            const template = document.createElement('template');
            template.innerHTML = t.e;
            t.e = template;

            return t;
          }).reduceRight((acc, t) => {
            if (global.ShadyCSS) global.ShadyCSS.prepareTemplate(t.e);
            acc.unshift(t);
            return acc;
          }, []),
        };

        return;
      }
    }

    if (styles) {
      [].concat(styles).forEach((style) => { input = `<style>${style}</style>${input}`; });
    }

    const template = document.createElement('template');
    template.innerHTML = input;

    if (global.ShadyCSS) global.ShadyCSS.prepareTemplate(template, name);

    this.container = parseTemplate(template, { t: [], p: {} });
  }

  compile(template = 0) {
    const templateId = getTemplateId(template);
    const map = this.container.t[templateId];
    if (!map) throw ReferenceError(`template not found: ${templateId}`);

    const fragment = document.importNode(map.e.content, true);
    let index = 0;

    walk(fragment, (node) => {
      const list = map.m[index];
      if (list) {
        list.forEach(({ a: attr, m: markerId, p: paths }) => {
          try {
            const marker = this.markers[markerId];

            if (process.env.NODE_ENV !== 'production' && !marker) {
              throw ReferenceError(`Marker '${markerId}' not found`);
            }

            const [exprKey, ...args] = paths[0];
            const filterList = paths.slice(1).map(([key, ...filterArgs]) =>
              value => this.container.p[key].call(this.filters, value, ...filterArgs),
            );

            const expr = new Expression(node, this.container.p[exprKey], filterList);
            const fn = marker.call(this, { attr, node, expr }, ...args);

            if (fn) {
              let state = null;
              let watchers = node[WATCHERS];

              if (!watchers) {
                watchers = [];
                Object.defineProperty(node, WATCHERS, { value: watchers });
              }

              watchers.push(() => {
                try {
                  if (!state) {
                    state = new State({ get value() { return expr.get(); } });
                    fn(state.cache.value, { type: 'set' }, this.compile);
                  } else if (state.isChanged()) {
                    fn(expr.get(), state.changelog.value, this.compile);
                  }
                } catch (error) {
                  error.msg += `\n\n Execution failed: ${stringifyMarker(node, attr, this.container.t)}`;
                  throw error;
                }
              });
            }
          } catch (error) {
            error.msg += `\n\n Compilation failed: ${stringifyMarker(node, attr, this.container.t)}`;
            throw error;
          }
        });
      }

      index += 1;
    });

    return fragment;
  }

  mount(shadowRoot, context) {
    shadowRoot.appendChild(this.compile());
    setNodeContext(shadowRoot, context);

    return () => {
      walk(shadowRoot, (node) => {
        const watchers = node[WATCHERS];
        if (watchers) watchers.forEach(fn => fn());
      });

      if (global.ShadyCSS && shadowRoot.host) global.ShadyCSS.styleElement(shadowRoot.host);
    };
  }

  export() {
    return JSON.parse(JSON.stringify(this.container, (key, value) => {
      if (typeof value === 'object' && value.nodeName === 'TEMPLATE') {
        return value.innerHTML;
      }

      return value;
    }));
  }
}

import { error } from '@hybrids/debug';
import Hybrid from './hybrid';
import { camelToDash, reflectValue } from './utils';
import { CONTROLLER, PROVIDERS, OPTIONS } from './symbols';

function normalizeProperty(property) {
  const type = typeof property;
  switch (type) {
    case 'string':
      return { property, attr: true, reflect: true };
    case 'object':
      return Object.assign({ attr: true, reflect: true }, property);
    default:
      return error(TypeError, 'property description must be an object or string: %s', type);
  }
}

function bootstrap(name, Controller) {
  if (window.customElements.get(name)) {
    const ExtHybrid = window.customElements.get(name);
    if (ExtHybrid[CONTROLLER] !== Controller) {
      error(TypeError, 'Element already defined: %s', name);
    } else {
      return ExtHybrid;
    }
  }

  const options = Controller.options || {};
  const properties = (options.properties || []).map(normalizeProperty);
  const observedAttributes = [];

  if (options.define) {
    if (typeof options.define === 'object') {
      defineHybrid(options.define); // eslint-disable-line no-use-before-define
    } else {
      error(TypeError, "'define' option must be an object: %s", typeof options.define);
    }
  }

  class ExtHybrid extends Hybrid {
    static get observedAttributes() { return observedAttributes; }
    static get [CONTROLLER]() { return Controller; }
    static get [OPTIONS]() { return options; }
  }

  options.properties = properties.filter(({ property, attr, reflect }) => {
    if (Reflect.has(ExtHybrid.prototype, property)) {
      error(ReferenceError, 'property already in HTMLElement prototype chain: %s', property);
    }

    if (Reflect.has(Controller.prototype, property)) {
      Object.defineProperty(ExtHybrid.prototype, property, {
        value(...args) { return this[CONTROLLER][property](...args); },
      });

      return false;
    }

    const attrName = camelToDash(property);

    Object.defineProperty(ExtHybrid.prototype, property, {
      get() {
        return this[CONTROLLER][property];
      },
      set(value) {
        this[CONTROLLER][property] = reflectValue(value, this[CONTROLLER][property]);
        const newValue = this[CONTROLLER][property];

        if (reflect && typeof newValue === 'boolean') {
          if (newValue) {
            this.setAttribute(attrName, '');
          } else {
            this.removeAttribute(attrName);
          }
        }
      },
    });

    if (attr) observedAttributes.push(attrName);

    return true;
  });

  Object.defineProperty(ExtHybrid, PROVIDERS, {
    value: [...new Set(options.use || [])].map((m) => {
      if (typeof m !== 'function') error(TypeError, 'provider must be a function: %s', typeof m);
      return m(ExtHybrid);
    }).filter(m => m),
  });

  window.customElements.define(name, ExtHybrid);

  return ExtHybrid;
}

export default function defineHybrid(...args) {
  if (!args.length) error(TypeError, 'invalid arguments');

  switch (typeof args[0]) {
    case 'object':
      return Object.keys(args[0]).reduce((acc, key) => {
        acc[key] = bootstrap(camelToDash(key), args[0][key]);
        return acc;
      }, {});
    case 'string':
      if (args.length === 1) {
        return (Controller) => {
          bootstrap(args[0], Controller);
          return Controller;
        };
      }

      return bootstrap(...args);
    default:
      return error(TypeError, 'invalid arguments');
  }
}

import { error } from '@hybrids/debug';
import Hybrid from './hybrid';
import { camelToDash, reflectValue } from './utils';
import { CONTROLLER, MIDDLEWARE, OPTIONS } from './symbols';

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
    if (window.customElements.get(name)[CONTROLLER] !== Controller) {
      error(TypeError, 'hybrid element already defined: %s', name);
    } else {
      return Controller;
    }
  }

  const options = Controller.options || {};
  const properties = (options.properties || []).map(normalizeProperty);
  const observedAttributes = [];

  class ExtHybrid extends Hybrid {
    static get observedAttributes() { return observedAttributes; }
    static get [CONTROLLER]() { return Controller; }
    static get [OPTIONS]() { return options; }
  }

  options.properties = properties.filter(({ property, attr, reflect }) => {
    if (Reflect.has(ExtHybrid.prototype, property)) {
      error(ReferenceError, "'%s': already in HTMLElement prototype chain", property);
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

  const set = new Set((options.use || []).concat(Controller.use || []));

  Object.defineProperty(ExtHybrid, MIDDLEWARE, {
    value: [...set].map(m => m(ExtHybrid)).filter(m => m),
  });

  return window.customElements.define(name, ExtHybrid);
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
        return () => {
          bootstrap.bind(null, args[0]);
          return args[0];
        };
      }

      return bootstrap(...args);
    default:
      return error(TypeError, 'invalid arguments');
  }
}

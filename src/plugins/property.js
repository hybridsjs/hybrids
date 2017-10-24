import { camelToDash } from '../utils';
import { COMPONENT } from '../symbols';

export default (Constructor, { attr = true } = {}) => (key, Wrapper) => {
  if (process.env.NODE_ENV !== 'production' && (Reflect.has(Wrapper.prototype, key))) {
    throw TypeError(`Property '${key}' already defined in '${Wrapper}' prototype`);
  }

  if (attr) {
    Wrapper.observedAttributes.push(camelToDash(key));
  }

  const resolve = Constructor ? (val) => {
    if (val !== undefined) {
      return Constructor(val);
    }
    return Constructor();
  } : val => val;

  Object.defineProperty(Wrapper.prototype, key, {
    get() { return this[COMPONENT][key]; },
    set(val) { this[COMPONENT][key] = resolve(val); },
    enumerable: true,
  });

  return (host, set, defaultValue) => {
    if ({}.hasOwnProperty.call(host, key)) {
      defaultValue = host[key];
      delete host[key];
    }

    return defaultValue;
  };
};

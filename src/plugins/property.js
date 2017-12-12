import { camelToDash } from '../utils';

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

  return (host, component) => {
    let value = component[key];

    if ({}.hasOwnProperty.call(host, key)) {
      value = host[key];
    }

    Object.defineProperty(host, key, {
      get() { return component[key]; },
      set(val) { component[key] = resolve(val); },
      enumerable: true,
    });

    component[key] = value;
  };
};

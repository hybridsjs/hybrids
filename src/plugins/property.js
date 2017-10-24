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

  return (host, set, get) => {
    let value = get();

    if ({}.hasOwnProperty.call(host, key)) {
      value = host[key];
    }

    Object.defineProperty(host, key, {
      get,
      set(val) { set(resolve(val)); },
      enumerable: true,
    });

    return value;
  };
};

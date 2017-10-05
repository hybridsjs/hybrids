import { camelToDash } from '../utils';

export default (Constructor = String, { attr = true } = {}) => (key, Wrapper) => {
  if (attr) {
    Wrapper.observedAttributes.push(camelToDash(key));
  }

  return (host, get, set) => {
    const defaultValue = host[key];

    Object.defineProperty(host, key, {
      get,
      set: val => set(typeof val === 'object' ? val : Constructor(val)),
    });

    if (defaultValue !== undefined) {
      host[key] = defaultValue;
    } else if (get() === undefined) {
      set(undefined);
    }
  };
};

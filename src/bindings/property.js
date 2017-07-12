import { camelToDash } from '../utils';

export default (Constructor = String, { attr = true } = {}) => (key, Wrapper) => {
  if (attr) {
    Wrapper.observedAttributes.push(camelToDash(key));
  }

  return (host, component) => {
    const defaultValue = host[key];

    Object.defineProperty(host, key, {
      get: () => component[key],
      set: val => (component[key] = typeof val === 'object' ? val : Constructor(val)),
    });

    if (defaultValue !== undefined) {
      host[key] = defaultValue;
    } else {
      component[key] = host[key];
    }
  };
};

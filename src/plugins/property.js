import { camelToDash } from '../utils';

export default (Constructor, { attr = true } = {}) => (key, Wrapper) => {
  if (attr) {
    Wrapper.observedAttributes.push(camelToDash(key));
  }

  return (host, get, set) => {
    const defaultValue = host[key];

    Object.defineProperty(host, key, {
      get,
      set: Constructor ? val => set(val ? Constructor(val) : Constructor()) : val => set(val),
    });

    if (defaultValue !== undefined) {
      host[key] = defaultValue;
    } else if (get() === undefined) {
      set(undefined);
    }
  };
};

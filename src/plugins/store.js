import observe from '../observe';

const stores = new WeakMap();

export default (store) => {
  if (process.env.NODE_ENV !== 'production' && (typeof store !== 'object' || store === null)) {
    throw TypeError(`Store must be an object: ${typeof store}`);
  }

  let register = stores.get(store);
  if (!register) {
    register = new Set();
    stores.set(store, register);

    Object.keys(store).forEach(propertyName => observe(
      store,
      propertyName,
      () => register.forEach(set => set(store)),
    ));
  }

  return () => (host, set) => {
    host.addEventListener('@connect', () => {
      register.add(set);
    });

    host.addEventListener('@disconnect', () => {
      register.delete(set);
    });

    return store;
  };
};

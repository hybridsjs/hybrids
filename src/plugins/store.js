import observe from '../observe';

const stores = new WeakMap();

export default store => (key) => {
  if (process.env.NODE_ENV !== 'production' && (typeof store !== 'object' || store === null)) {
    throw TypeError(`Store '${key}' must be an object: ${typeof store}`);
  }

  let register = stores.get(store);
  if (!register) {
    register = new Set();
    stores.set(store, register);

    Object.keys(store).forEach(propertyName => observe(
      store,
      propertyName,
      () => register.forEach(cb => cb()),
    ));
  }

  return (host, get, set) => {
    const update = () => set(store);

    host.addEventListener('@connect', () => {
      register.add(update);
    });

    host.addEventListener('@disconnect', () => {
      register.delete(update);
    });

    update();
  };
};

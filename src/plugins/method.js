export default () => key => (host, component) => {
  if (process.env.NODE_ENV !== 'production' && (Reflect.has(host, key))) {
    throw TypeError(`Property '${key}' already defined in '${host}'`);
  }

  host[key] = (...args) => component[key](...args);
};

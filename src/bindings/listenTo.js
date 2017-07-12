export default (eventType, options) => (key, Wrapper, Component) => {
  if (!Reflect.has(Component.prototype, key)) {
    throw Error(`'${key}' not found in ${Component.name} prototype`);
  }

  return (host, component) => {
    host.addEventListener(eventType, event => component[key](event), options);
  };
};

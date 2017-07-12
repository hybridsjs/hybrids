export default (eventType, options) => (key, Wrapper, Component) => {
  if (!Reflect.has(Component.prototype, key)) {
    throw Error(`'${key}' not found in ${Component.name} prototype`);
  }

  return (host, component) => {
    const fn = component[key];
    Object.defineProperty(component, key, {
      value: (...args) => {
        const results = fn.apply(component, args);
        if (results === false) return;

        host.dispatchEvent(
          new CustomEvent(eventType, { ...options, detail: results }),
        );
      },
    });
  };
};

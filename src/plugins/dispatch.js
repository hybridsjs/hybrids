export default (type, options = {}) => key => (host, component) => {
  const fn = component[key];

  component[key] = function withDispatch(...args) {
    const result = fn.call(this, ...args);
    if (result !== false) {
      host.dispatchEvent(new CustomEvent(type, { ...options, detail: result }));
    }
  };
};

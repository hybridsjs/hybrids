import bootstrap from '../bootstrap';

export default Component => (baseKey, Wrapper) => {
  const plugins = [];

  Object.entries(Component.plugins || {}).forEach(([key, plugin]) => {
    const fn = plugin(key, Wrapper, Component);
    if (fn) plugins.push(fn);
  });

  return (host, component) => {
    component[baseKey] = bootstrap({ Component, host, plugins });
  };
};

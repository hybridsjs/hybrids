import bootstrap from '../bootstrap';

export default Component => (baseKey, Wrapper) => {
  const plugins = [];

  Object.entries(Component.plugins || {}).forEach(([key, plugin]) => {
    const fn = plugin(key, Wrapper, Component);
    if (fn) plugins.push([key, fn]);
  });

  return host => bootstrap({ Component, host, plugins });
};

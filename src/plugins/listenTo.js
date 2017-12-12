export default (type, options) => key => (host, component) => {
  host.addEventListener(type, event => component[key](event), options);
};

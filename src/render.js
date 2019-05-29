export default function render(get, customOptions = {}) {
  if (typeof get !== 'function') {
    throw TypeError(`The first argument must be a function: ${typeof get}`);
  }

  const options = { shadowRoot: true, ...customOptions };
  const shadowRootInit = { mode: 'open' };

  if (typeof options.shadowRoot === 'object') {
    Object.assign(shadowRootInit, options.shadowRoot);
  }

  return {
    get(host) {
      const fn = get(host);
      return function flush() {
        fn(host, options.shadowRoot ? host.shadowRoot : host);
      };
    },
    connect(host) {
      if (options.shadowRoot && !host.shadowRoot) {
        host.attachShadow(shadowRootInit);
      }
    },
    observe(host, fn) {
      fn();
    },
  };
}

export default function render(fn, customOptions = {}) {
  if (typeof fn !== 'function') {
    throw TypeError(`The first argument must be a function: ${typeof fn}`);
  }

  const options = { shadowRoot: true, ...customOptions };
  const shadowRootInit = { mode: 'open' };

  if (typeof options.shadowRoot === 'object') {
    Object.assign(shadowRootInit, options.shadowRoot);
  }

  return {
    get(host) {
      const update = fn(host);
      return function flush() {
        update(host, options.shadowRoot ? host.shadowRoot : host);
      };
    },
    connect(host) {
      if (options.shadowRoot && !host.shadowRoot) {
        host.attachShadow(shadowRootInit);
      }
    },
    observe(host, flush) {
      flush();
    },
  };
}

export default function render(fn, customOptions = {}) {
  if (typeof fn !== "function") {
    throw TypeError(`The first argument must be a function: ${typeof fn}`);
  }

  const options = { shadowRoot: true, ...customOptions };
  const shadowRootInit = { mode: "open" };

  if (typeof options.shadowRoot === "object") {
    Object.assign(shadowRootInit, options.shadowRoot);
  }

  return {
    get(host) {
      const update = fn(host);
      let target = host;

      if (options.shadowRoot) {
        if (!host.shadowRoot) host.attachShadow(shadowRootInit);
        target = host.shadowRoot;
      }

      return function flush() {
        update(host, target);
        return target;
      };
    },
    observe(host, flush) {
      flush();
    },
  };
}

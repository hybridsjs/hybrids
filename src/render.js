export default function render(fn, customOptions = {}) {
  if (typeof fn !== "function") {
    throw TypeError(`The first argument must be a function: ${typeof fn}`);
  }

  const options = { shadowRoot: true, ...customOptions };
  const shadowRootInit = { mode: "open" };

  if (typeof options.shadowRoot === "object") {
    Object.assign(shadowRootInit, options.shadowRoot);
  }

  const getTarget = options.shadowRoot
    ? host => host.shadowRoot || host.attachShadow(shadowRootInit)
    : host => host;

  return {
    get(host) {
      const update = fn(host);
      const target = getTarget(host);

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

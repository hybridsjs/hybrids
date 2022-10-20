export default function render(fn, useShadow) {
  return {
    get: useShadow
      ? (host) => {
          const updateDOM = fn(host);
          const target =
            host.shadowRoot ||
            host.attachShadow({
              mode: "open",
              delegatesFocus: fn.delegatesFocus || false,
            });
          return () => {
            updateDOM(host, target);
            return target;
          };
        }
      : (host) => {
          const updateDOM = fn(host);
          return () => {
            updateDOM(host, host);
            return host;
          };
        },
    observe(host, flush) {
      flush();
    },
  };
}

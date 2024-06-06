export default function render(desc) {
  if (desc.reflect) {
    throw TypeError(`'reflect' option is not supported for 'render' property`);
  }

  const { value: fn, observe } = desc;

  if (typeof fn !== "function") {
    throw TypeError(
      `Value for 'render' property must be a function: ${typeof fn}`,
    );
  }

  const result = {
    connect: desc.connect,
    observe: observe
      ? (host, flush, lastFlush) => {
          observe(host, flush(), lastFlush);
        }
      : (host, flush) => {
          flush();
        },
  };

  const shadow = desc.shadow
    ? {
        mode: desc.shadow.mode || "open",
        delegatesFocus: desc.shadow.delegatesFocus || false,
      }
    : desc.shadow;

  if (shadow) {
    result.value = (host) => {
      const target = host.shadowRoot || host.attachShadow(shadow);
      const update = fn(host);

      return () => {
        update(host, target);
        return target;
      };
    };
  } else if (shadow === false) {
    result.value = (host) => {
      const update = fn(host);
      return () => {
        update(host, host);
        return host;
      };
    };
  } else {
    result.value = (host) => {
      const update = fn(host);
      return () => update(host);
    };
  }

  return result;
}

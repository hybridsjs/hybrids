export default function render(key, desc) {
  if (desc.reflect) {
    throw TypeError(`'reflect' option is not supported for '${key}' property`);
  }

  const { value: fn, observe } = desc;

  if (typeof fn !== "function") {
    throw TypeError(
      `Value for '${key}' property must be a function: ${typeof fn}`,
    );
  }

  const rest = {
    connect: desc.connect,
    observe: observe
      ? (host, flush, lastFlush) => {
          observe(host, flush(), lastFlush);
        }
      : (host, flush) => {
          flush();
        },
  };

  if (key === "render") {
    const options = desc.options || {};

    const shadowOptions = key === "render" && {
      mode: options.mode || "open",
      delegatesFocus: options.delegatesFocus,
    };

    return {
      value: (host) => {
        const updateDOM = fn(host);

        return () => {
          const target = host.shadowRoot || host.attachShadow(shadowOptions);

          updateDOM(host, target);
          return target;
        };
      },
      ...rest,
    };
  } else {
    return {
      value: (host) => {
        const updateDOM = fn(host);
        return () => {
          updateDOM(host, host);
          return host;
        };
      },
      ...rest,
    };
  }
}

export const shadowOptions = new WeakMap();

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

  const shadow = desc.shadow
    ? {
        mode: desc.shadow.mode || "open",
        delegatesFocus: desc.shadow.delegatesFocus || false,
      }
    : desc.shadow;

  return {
    value: (host) => {
      const updateDOM = fn(host);
      shadowOptions.set(host, shadow);

      return () => updateDOM(host);
    },
    ...rest,
  };
}

export function polyfill(global) {
  global = Object.create(global);

  if (!("HTMLElement" in global)) {
    Object.defineProperty(global, "HTMLElement", {
      value: class HTMLElement {
        constructor() {
          throw Error(
            "Current context does not support defining custom elements",
          );
        }
      },
    });
  }

  if (!("document" in global)) {
    Object.defineProperty(global, "document", {
      value: {
        importNode: () => {
          throw Error("Current context does not support importing nodes");
        },
      },
    });
  }

  return global;
}

/* istanbul ignore next */ // eslint-disable-next-line no-undef
export default typeof window === "object" ? window : polyfill(globalThis);

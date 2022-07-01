/* eslint-disable no-undef */

export function polyfill(global) {
  global = Object.create(global);

  if (!("requestAnimationFrame" in global)) {
    Object.defineProperty(global, "requestAnimationFrame", {
      value: function requestAnimationFrame(callback) {
        return setTimeout(callback, 0);
      },
    });
  }

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

  return global;
}

/* istanbul ignore next */
export default typeof window === "object" ? window : polyfill(globalThis);

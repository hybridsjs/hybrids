import resolveValue from "../resolvers/value.js";

const promiseMap = new WeakMap();
export default function resolve(promise, placeholder, delay = 200) {
  return function fn(host, target) {
    const useLayout = fn.useLayout;
    let timeout;

    if (placeholder) {
      timeout = setTimeout(() => {
        timeout = undefined;
        resolveValue(host, target, placeholder, undefined, useLayout);
      }, delay);
    }

    promiseMap.set(target, promise);

    promise.then((value) => {
      if (timeout) clearTimeout(timeout);

      if (promiseMap.get(target) === promise) {
        resolveValue(
          host,
          target,
          value,
          placeholder && !timeout ? placeholder : undefined,
          useLayout,
        );
        promiseMap.set(target, null);
      }
    });
  };
}

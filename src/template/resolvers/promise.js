// target -> { lastValue } where lastValue is the value currently rendered
export const promiseMap = new WeakMap();

export default function resolvePromise(
  host,
  target,
  promise,
  lastValue,
  resolveValue,
  useLayout,
) {
  const pending = { lastValue };
  promiseMap.set(target, pending);

  promise.then((value) => {
    if (promiseMap.get(target) === pending) {
      resolveValue(host, target, value, lastValue, useLayout);

      // keep the entry, so the next update knows what is rendered
      pending.lastValue = value;
    }
  });
}

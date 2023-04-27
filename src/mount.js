import define from "./define.js";
import { invalidate } from "./cache.js";
import { camelToDash } from "./utils.js";

const targets = new WeakMap();
const prevMap = new WeakMap();
export default function mount(target, hybrids) {
  const prevHybrids = prevMap.get(target);
  if (prevHybrids === hybrids) return;

  const HybridsElement = define.compile(hybrids);
  prevMap.set(target, hybrids);

  if (targets.has(target)) targets.get(target)();

  targets.set(target, () => {
    HybridsElement.prototype.disconnectedCallback.call(target);

    for (const [key] of descriptors) {
      delete target[key];
    }

    targets.delete(target);
  });

  const descriptors = Object.entries(
    Object.getOwnPropertyDescriptors(HybridsElement.prototype),
  );

  HybridsElement.prototype.connectedCallback.call(target);

  for (const [key, desc] of descriptors) {
    if (
      key === "constructor" ||
      key === "connectedCallback" ||
      key === "disconnectedCallback"
    ) {
      continue;
    }

    Object.defineProperty(target, key, {
      ...desc,
      configurable: true,
    });

    if (prevHybrids) {
      const type = typeof hybrids[key];
      const clearValue =
        type !== "object" &&
        type !== "function" &&
        hybrids[key] !== prevHybrids[key];

      if (clearValue) target.removeAttribute(camelToDash(key));
      invalidate(target, key, { clearValue });
    }
  }
}

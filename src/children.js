import { constructors } from "./define.js";

function walk(node, fn, options, items = [], host = node) {
  for (const child of Array.from(node.children)) {
    const hybrids = constructors.get(child.constructor);
    if (hybrids && fn(hybrids, host)) {
      items.push(child);
      if (options.deep && options.nested) {
        walk(child, fn, options, items, host);
      }
    } else if (options.deep) {
      walk(child, fn, options, items, host);
    }
  }

  return items;
}

export default function children(
  hybridsOrFn,
  options = { deep: false, nested: false },
) {
  const fn =
    typeof hybridsOrFn === "function"
      ? hybridsOrFn
      : (hybrids) => hybrids === hybridsOrFn;

  return {
    get: (host) => walk(host, fn, options),
    connect(host, key, invalidate) {
      const observer = new globalThis.MutationObserver(invalidate);

      observer.observe(host, {
        childList: true,
        subtree: !!options.deep,
      });

      return () => {
        observer.disconnect();
      };
    },
  };
}

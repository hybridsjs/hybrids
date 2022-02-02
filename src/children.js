import global from "./global.js";

function walk(node, fn, options, items = []) {
  Array.from(node.children).forEach((child) => {
    const hybrids = child.constructor.hybrids;
    if (hybrids && fn(hybrids)) {
      items.push(child);
      if (options.deep && options.nested) {
        walk(child, fn, options, items);
      }
    } else if (options.deep) {
      walk(child, fn, options, items);
    }
  });

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
      const observer = new global.MutationObserver(invalidate);

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

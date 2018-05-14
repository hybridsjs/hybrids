const map = new WeakMap();

document.addEventListener('@invalidate', (event) => {
  const set = map.get(event.composedPath()[0]);
  if (set) set.forEach(fn => fn());
});

function walk(node, hybrids) {
  let parentElement = node.parentElement || node.parentNode.host;

  while (parentElement) {
    const parentHybrids = parentElement.constructor.hybrids;

    if (parentHybrids === hybrids) {
      return parentElement;
    }

    parentElement = parentElement.parentElement ||
      (parentElement.parentNode && parentElement.parentNode.host);
  }

  return parentElement || null;
}

export default function parent(hybrids) {
  return {
    get: host => walk(host, hybrids),
    connect(host, key, invalidate) {
      const target = host[key];

      if (target) {
        let set = map.get(target);
        if (!set) {
          set = new Set();
          map.set(target, set);
        }

        set.add(invalidate);

        return () => {
          set.delete(invalidate);
          invalidate();
        };
      }

      return false;
    },
  };
}

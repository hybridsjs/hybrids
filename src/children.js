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

export default function children(hybridsOrFn, options = { deep: false, nested: false }) {
  const fn = typeof hybridsOrFn === 'function' ? hybridsOrFn : hybrids => hybrids === hybridsOrFn;
  return {
    get(host) { return walk(host, fn, options); },
    connect(host, key, invalidate) {
      const observer = new MutationObserver(invalidate);
      const set = new Set();

      const childEventListener = ({ target }) => {
        if (!set.size) {
          Promise.resolve().then(() => {
            const list = host[key];
            for (let i = 0; i < list.length; i += 1) {
              if (set.has(list[i])) {
                invalidate(false);
                break;
              }
            }
            set.clear();
          });
        }
        set.add(target);
      };

      observer.observe(host, {
        childList: true, subtree: !!options.deep,
      });

      host.addEventListener('@invalidate', childEventListener);

      return () => {
        observer.disconnect();
        host.removeEventListener('@invalidate', childEventListener);
      };
    },
  };
}

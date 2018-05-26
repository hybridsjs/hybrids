function walk(node, hybrids, options, items = []) {
  Array.from(node.children).forEach((child) => {
    const childHybrids = child.constructor.hybrids;
    if (childHybrids && childHybrids === hybrids) {
      items.push(child);
      if (options.deep && options.nested) {
        walk(child, hybrids, options, items);
      }
    } else if (options.deep) {
      walk(child, hybrids, options, items);
    }
  });

  return items;
}

export default function children(hybrids, options = { deep: false, nested: false }) {
  return {
    get(host) { return walk(host, hybrids, options); },
    connect(host, key, invalidate) {
      const observer = new MutationObserver(invalidate);
      const set = new Set();

      const childEventListener = ({ target }) => {
        if (!set.size) {
          Promise.resolve().then(() => {
            const targets = [...set];
            const list = host[key];

            for (let i = 0; i < list.length; i += 1) {
              if (list.indexOf(targets[i]) > -1) {
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

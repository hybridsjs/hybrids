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
      const childEventListener = ({ target }) => {
        if (target !== host && host[key].includes(target)) invalidate(false);
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

function walk(node, fn) {
  let parentElement = node.parentElement || node.parentNode.host;

  while (parentElement) {
    const hybrids = parentElement.constructor.hybrids;

    if (hybrids && fn(hybrids)) {
      return parentElement;
    }

    parentElement =
      parentElement.parentElement ||
      (parentElement.parentNode && parentElement.parentNode.host);
  }

  return parentElement || null;
}

export default function parent(hybridsOrFn) {
  const fn =
    typeof hybridsOrFn === "function"
      ? hybridsOrFn
      : hybrids => hybrids === hybridsOrFn;
  return {
    get: host => walk(host, fn),
    connect(host, key, invalidate) {
      const target = host[key];
      if (target) {
        return invalidate;
      }
      return false;
    },
  };
}

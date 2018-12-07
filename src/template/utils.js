const map = new WeakMap();
export const dataMap = {
  get(key, defaultValue) {
    if (map.has(key)) {
      return map.get(key);
    }

    if (defaultValue !== undefined) {
      map.set(key, defaultValue);
    }

    return defaultValue;
  },
  set(key, value) {
    map.set(key, value);
    return value;
  },
};

export function getTemplateEnd(node) {
  let data;
  // eslint-disable-next-line no-cond-assign
  while (node && (data = dataMap.get(node)) && data.endNode) {
    node = data.endNode;
  }

  return node;
}

export function removeTemplate(target) {
  const data = dataMap.get(target);
  const startNode = data.startNode;

  if (startNode) {
    const endNode = getTemplateEnd(data.endNode);

    let node = startNode;
    const lastNextSibling = endNode.nextSibling;

    while (node) {
      const nextSibling = node.nextSibling;
      node.parentNode.removeChild(node);
      node = nextSibling !== lastNextSibling && nextSibling;
    }
  }
}

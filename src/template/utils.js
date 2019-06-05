const map = new WeakMap();
export const dataMap = {
  get(key, defaultValue) {
    const value = map.get(key);
    if (value) return value;

    if (defaultValue) {
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
  if (target.nodeType !== Node.TEXT_NODE) {
    let child = target.childNodes[0];
    while (child) {
      target.removeChild(child);
      child = target.childNodes[0];
    }
  } else {
    const data = dataMap.get(target);

    if (data.startNode) {
      const endNode = getTemplateEnd(data.endNode);

      let node = data.startNode;
      const lastNextSibling = endNode.nextSibling;

      while (node) {
        const nextSibling = node.nextSibling;
        node.parentNode.removeChild(node);
        node = nextSibling !== lastNextSibling && nextSibling;
      }
    }
  }
}

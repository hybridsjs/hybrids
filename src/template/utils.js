import global from "../global.js";

const metaMap = new WeakMap();
export function getMeta(key) {
  let value = metaMap.get(key);
  if (value) return value;

  metaMap.set(key, (value = {}));
  return value;
}

export function getTemplateEnd(node) {
  let meta;

  while (node && (meta = getMeta(node)) && meta.endNode) {
    node = meta.endNode;
  }

  return node;
}

export function removeTemplate(target) {
  const data = getMeta(target);

  if (data.styles) data.styles();

  if (target.nodeType === global.Node.TEXT_NODE) {
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
  } else {
    let child = target.childNodes[0];
    while (child) {
      target.removeChild(child);
      child = target.childNodes[0];
    }
  }

  metaMap.delete(target);
}

const TIMESTAMP = Date.now();
export const getPlaceholder = (id = 0) => `H-${TIMESTAMP}-${id}`;

import { error } from '@hybrids/debug';

export default function If(node, expr) {
  if (!(node instanceof HTMLTemplateElement)) {
    error(TypeError, '[if]: <template> element required');
  }

  let list = [];

  return (changelog, engine) => {
    if (expr.get()) {
      const fragment = engine.compile(node);
      list = Array.from(fragment.childNodes);
      node.parentNode.insertBefore(fragment, node.nextSibling);
    } else {
      const fragment = document.createDocumentFragment();
      list.forEach((child) => {
        fragment.appendChild(child);
      });
      list = [];
    }
  };
}

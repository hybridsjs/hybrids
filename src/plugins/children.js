import { COMPONENT } from '../symbols';
import { defer } from '../utils';

function walk(node, Component, options, items = []) {
  Array.from(node.children).forEach((child) => {
    const component = child[COMPONENT];
    if (component && component instanceof Component) {
      items.push(component);
      if (options.deep && options.nested) walk(child, Component, options, items);
    } else if (options.deep) walk(child, Component, options, items);
  });

  return items;
}

export default (Component, options = {}) => () => (host, get, set) => {
  let items = [];
  set(items);

  const resolveItems = defer(() => {
    items = walk(host, Component, options);
    set(items);
  });

  const refreshItems = defer(() => {
    set(items);
  });

  new MutationObserver(resolveItems).observe(host, {
    childList: true, subtree: !!options.deep,
  });

  if (options.observe !== false) {
    host.addEventListener('@change', ({ target }) => {
      if (target !== host && items && items.includes(target[COMPONENT])) {
        refreshItems();
      }
    });
  }

  resolveItems();
};

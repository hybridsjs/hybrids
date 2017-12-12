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

export default (Component, options = {}) => key => (host, component) => {
  let items = [];

  const resolveItems = () => {
    items = walk(host, Component, options);
    component[key] = items;
  };

  const refreshItems = () => {
    component[key] = items;
  };

  new MutationObserver(() => defer(resolveItems)).observe(host, {
    childList: true, subtree: !!options.deep,
  });

  if (options.observe !== false) {
    host.addEventListener('@change', ({ target }) => {
      if (target !== host && items && items.includes(target[COMPONENT])) {
        defer(refreshItems);
      }
    });
  }

  defer(resolveItems);
  component[key] = items;
};

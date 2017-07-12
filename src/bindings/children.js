import { COMPONENT, OBSERVER } from '../symbols';

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
  const items = [];
  let set;

  component[key] = items;

  if (!Array.isArray(items)) {
    throw Error('target property must be an array instance');
  }

  const resolveItems = () => {
    const temp = walk(host, Component, options);
    set = new WeakSet(temp);

    Object.assign(items, temp);
    items.length = temp.length;

    component[key] = items;
  };

  new MutationObserver(resolveItems).observe(host, {
    childList: true, subtree: !!options.deep,
  });

  host.addEventListener('@connect', resolveItems);

  host.addEventListener('@update', ({ target }) => {
    if (target !== host && set.has(target[COMPONENT])) {
      host[OBSERVER].check();
    }
  });
};

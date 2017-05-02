import { error } from './debug';
import { injectable } from './proxy';
import { CONTROLLER } from './symbols';

function walk(node, Controller, options, items = []) {
  Array.from(node.children).forEach((child) => {
    if (child.constructor[CONTROLLER] === Controller) {
      items.push(child[CONTROLLER]);
      if (options.deep && options.nested) walk(child, Controller, options, items);
    } else if (options.deep) walk(child, Controller, options, items);
  });

  return items;
}

export function children(host, propertyName, Controller, options = {}) {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof propertyName !== 'string') error(TypeError, 'children: Invalid arguments');
    if (typeof Controller !== 'function') error(TypeError, 'children: Invalid arguments');
    if (typeof options !== 'object') {
      error(TypeError, 'children: options must be an object: %options', {
        options: typeof options
      });
    }
    if (host[CONTROLLER]) error(Error, 'children: Illegal invocation');
  }

  const items = [];
  const refresh = () => {
    const temp = walk(host, Controller, options);

    Object.assign(items, temp);
    items.length = temp.length;

    host[CONTROLLER][propertyName] = items;
  };

  new MutationObserver(refresh).observe(host, {
    childList: true, subtree: !!options.deep
  });

  host.addEventListener('hybrid-connect', refresh);
}

export default injectable(children);

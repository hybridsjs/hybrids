import { error } from './debug';
import { injectable } from './proxy';
import { CONTROLLER } from './symbols';

import { dispatchEvent } from './dispatch-event';

function walk(node, Controller, options, items = []) {
  Array.from(node.children).forEach((child) => {
    if (child.constructor[CONTROLLER] === Controller) {
      items.push(child[CONTROLLER]);
      if (options.deep && options.nested) walk(child, Controller, options, items);
    } else if (options.deep) walk(child, Controller, options, items);
  });

  return items;
}

export function children(host, Controller, options = {}) {
  if (process.env.NODE_ENV !== 'production') {
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

    dispatchEvent(host, 'hybrid-update', { bubbles: false });
  };

  new MutationObserver(refresh).observe(host, {
    childList: true, subtree: !!options.deep
  });

  host.addEventListener('hybrid-connect', refresh);

  return items;
}

export default injectable(children);

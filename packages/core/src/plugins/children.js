import { error } from '@hybrids/debug';

import { injectable } from '../proxy';
import { CONTROLLER, UPDATE } from '../symbols';

class Children {
  constructor(host, Controller, options = { deep: false, nested: false }) {
    if (!Controller) error(TypeError, '[core|children] Invalid arguments');
    if (typeof options !== 'object') error(TypeError, '[core|children] Invalid arguments');

    if (host[CONTROLLER]) error(Error, '[core|children] Illegal invocation');

    this.host = host;
    this.Controller = Controller;
    this.options = options;
    this.items = [];
    this.refresh = this.refresh.bind(this);
    this.observer = new MutationObserver(this.refresh);

    this.observer.observe(this.host, {
      childList: true, subtree: !!this.options.deep
    });

    this.host.addEventListener('upgrade', this.refresh);
  }

  refresh() {
    const temp = this.walk(this.host);

    Object.assign(this.items, temp);
    this.items.length = temp.length;

    this.host[UPDATE]();
  }

  walk(node, items = []) {
    Array.from(node.children).forEach((child) => {
      if (child.constructor[CONTROLLER] === this.Controller) {
        items.push(child[CONTROLLER]);
        if (this.options.deep && this.options.nested) this.walk(child, items);
      } else if (this.options.deep) this.walk(child, items);
    });

    return items;
  }
}

export function children(Controller, options) {
  return new Children(this, Controller, options).items;
}

export default injectable(children);

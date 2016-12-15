import { error } from '@hybrids/debug';

import { injectable } from '../proxy';
import { CONTROLLER, PROVIDERS, OBSERVER, CONNECTED } from '../symbols';

class ChildrenProvider {
  constructor(host, Controller, options = { deep: false, nested: false }) {
    if (!Controller) error(TypeError, '[core|children] Invalid arguments');
    if (typeof options !== 'object') error(TypeError, '[core|children] Invalid arguments');

    this.host = host;
    this.Controller = Controller;
    this.options = options;

    this.items = [];
    this.observer = new MutationObserver(() => {
      this.refresh();
      this.host[OBSERVER].check();
    });

    this.observer.observe(this.host, {
      childList: true, subtree: !!this.options.deep
    });

    this.refresh();
  }

  refresh() {
    const temp = this.walk(this.host);

    Object.assign(this.items, temp);
    this.items.length = temp.length;
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

  disconnected() {
    debugger;
    this.observer.disconnect();
  }
}

export function children(Controller, options) {
  if (!this[CONNECTED]) return error(Error, '[core|children] Illegal invocation');

  const provider = new ChildrenProvider(this, Controller, options);
  this[PROVIDERS].push(provider);

  return provider.items;
}

export default injectable(children);

import { error } from '@hybrids/debug';

import { injectable } from '../proxy';
import { CONTROLLER, PROVIDERS, OBSERVER, CONNECTED } from '../symbols';

class ChildrenProvider {
  constructor(host, Controller, options = { deep: false, nested: false }) {
    if (!Controller) error(TypeError, 'invalid arguments');
    if (typeof options !== 'object') error(TypeError, 'invalid arguments');

    this.host = host;
    this.Controller = Controller;
    this.options = options;

    this.items = [];
    this.observer = new MutationObserver(() => {
      this.refresh();
      this.host[OBSERVER].check();
    });

    this.refresh();
    if (this.host[CONNECTED]) this.observe();
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

  observe() {
    this.observer.observe(this.host, { childList: true, subtree: !!this.options.deep });
  }

  connected() {
    this.observe();
  }

  disconnected() {
    this.observer.disconnect();
  }
}

export function children(Controller, options) {
  const provider = new ChildrenProvider(this, Controller, options);
  this[PROVIDERS].push(provider);

  return provider.items;
}

export default injectable(children);

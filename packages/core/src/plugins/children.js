import { error } from '@hybrids/debug';

import { injectable } from '../proxy';
import { CONTROLLER, PROVIDERS, OBSERVER, CONNECTED } from '../symbols';

class ChildrenProvider {
  constructor(host, options) {
    this.host = host;
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
      if (child.constructor[CONTROLLER] === this.options.constructor) {
        items.push(child[CONTROLLER]);
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

export function children(constructor, options = { deep: false }) {
  options = Object.assign({}, options, { constructor });
  if (!options.constructor) error(TypeError, 'invalid arguments');

  const provider = new ChildrenProvider(this, options);
  this[PROVIDERS].push(provider);

  return provider.items;
}

export default injectable(children);

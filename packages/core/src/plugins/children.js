import { error } from '../debug';

import { injectable } from '../proxy';
import { CONTROLLER } from '../symbols';
import { dispatchEvent } from './dispatch-event';

class Children {
  constructor(host, Controller, options = { deep: false, nested: false }) {
    if (typeof Controller !== 'function') error(TypeError, 'children: Invalid arguments');
    if (typeof options !== 'object') {
      error(TypeError, 'children: options must be an object: %options', {
        options: typeof options
      });
    }
    if (host[CONTROLLER]) error(Error, 'children: Illegal invocation');

    this.host = host;
    this.Controller = Controller;
    this.options = options;
    this.items = [];
    this.refresh = this.refresh.bind(this);
    this.observer = new MutationObserver(this.refresh);

    this.observer.observe(this.host, {
      childList: true, subtree: !!this.options.deep
    });

    this.host.addEventListener('hybrid-connect', this.refresh);
  }

  refresh() {
    const temp = this.walk(this.host);

    Object.assign(this.items, temp);
    this.items.length = temp.length;

    dispatchEvent.call(this.host, 'hybrid-update', { bubbles: false });
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

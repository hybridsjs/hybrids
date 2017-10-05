import { setNodeContext, getNodeContext } from '../../expression';

const map = new WeakMap();

export default class VirtualFragment {
  constructor(fragment, target, saveReference) {
    this.items = fragment ? Array.from(fragment.childNodes) : [];
    this.target = target;

    if (saveReference) map.set(target, this);
  }

  getFirstItem() {
    return this.items[0];
  }

  getLastItem() {
    return this.items[this.items.length - 1];
  }

  getValue() {
    return this.value;
  }

  isAfter(fragment) {
    return fragment && fragment.getLastItem().nextSibling === this.getFirstItem();
  }

  remove() {
    this.items.forEach((item) => {
      if (item instanceof VirtualFragment) {
        item.remove();
      } else {
        const fragment = map.get(item);
        if (fragment) fragment.remove();
        item.parentNode.removeChild(item);
      }
    });
  }

  insertAfter(target = this.target) {
    if (!this.items.length) return target;

    if (target instanceof VirtualFragment) {
      target = target.getLastItem();
    } else if (target !== this.target && map.get(target)) {
      target = map.get(target).getLastItem() || target;
    }

    this.items.forEach((item) => {
      if (item instanceof VirtualFragment) {
        target = item.insertAfter(target);
      } else {
        target.parentNode.insertBefore(item, target.nextSibling);

        if (map.get(item)) {
          target = map.get(item).insertAfter(item);
        } else {
          target = item;
        }
      }
    });

    return target;
  }

  setLocals(locals, value) {
    locals = { ...getNodeContext(this.target), ...locals };

    this.value = value;
    this.items.forEach(item => setNodeContext(item, locals));
  }
}

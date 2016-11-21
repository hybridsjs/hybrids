import { defineLocals } from '../../expression';

export default class Fragment {
  constructor(fragment, locals) {
    this.items = Array.from(fragment.childNodes);
    if (locals) this.setLocals(locals);
  }

  setLocals(locals) {
    const { index, length } = locals;
    locals = Object.assign({
      number: index + 1,
      first: index === 0,
      last: index === length - 1,
      odd: index % 2 === 0,
      even: index % 2 === 1,
    }, locals);

    this.items.forEach(child => defineLocals(child, locals));
  }

  remove() {
    const fragment = document.createDocumentFragment();
    this.items.forEach(child => fragment.appendChild(child));
  }

  insertBefore(target, reference = target) {
    this.items.forEach((child) => {
      target.parentNode.insertBefore(child, reference);
      reference = child.nextSibling;
    });
  }

  getPointer() {
    return this.items[0];
  }
}

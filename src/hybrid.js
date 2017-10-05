import { dashToCamel } from './utils';

// BUG: Babel transpiled class breaks native custom elements
function HTMLBridge(...args) {
  return Reflect.construct(HTMLElement, args, this.constructor);
}
Object.setPrototypeOf(HTMLBridge.prototype, HTMLElement.prototype);

export default class Hybrid extends HTMLBridge {
  connectedCallback() {
    Promise.resolve().then(() => {
      this.dispatchEvent(new CustomEvent('@connect'));
    });
  }

  disconnectedCallback() {
    Promise.resolve().then(() => {
      this.dispatchEvent(new CustomEvent('@disconnect'));
    });
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    const property = dashToCamel(attrName);

    newVal = newVal !== null ? newVal : false;
    const newPropValue = newVal !== '' ? newVal : true;

    this[property] = newPropValue;
  }
}

import { proxy } from './proxy';
import { dashToCamel, queue } from './utils';
import { dispatchEvent } from './plugins/dispatch-event';

import { CONTROLLER, PROVIDERS, OPTIONS } from './symbols';

// BUG: Babel transpiled class breaks native custom elements
function HTMLBridge(...args) { return Reflect.construct(HTMLElement, args, this.constructor); }
Object.setPrototypeOf(HTMLBridge.prototype, HTMLElement.prototype);

export default class Hybrid extends HTMLBridge {
  constructor() {
    super();

    Object.defineProperty(this, CONTROLLER, {
      value: proxy(this, () => new this.constructor[CONTROLLER]()),
    });

    this.constructor[PROVIDERS].map(m => m(this));

    // BUG: https://github.com/webcomponents/custom-elements/issues/17
    Promise.resolve().then(() => dispatchEvent.call(this, 'upgrade', { bubbles: false }));
  }

  connectedCallback() {
    this.constructor[OPTIONS].properties.forEach(({ property }) => {
      if ({}.hasOwnProperty.call(this, property)) {
        const value = this[property];
        delete this[property];
        this[property] = value;
      }
    });

    if (this[CONTROLLER].connect) this[CONTROLLER].connect();
    dispatchEvent.call(this, 'connect', { bubbles: false });
  }

  disconnectedCallback() {
    if (this[CONTROLLER].disconnect) this[CONTROLLER].disconnect();
    dispatchEvent.call(this, 'disconnect', { bubbles: false });
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    const property = dashToCamel(attrName);

    newVal = newVal !== null ? newVal : false;
    const newPropValue = newVal !== '' ? newVal : true;

    if (newPropValue !== this[property]) queue(() => (this[property] = newPropValue));
  }

  get [Symbol.toStringTag]() { return 'HTMLHybridElement'; }
}

import { Observer } from 'papillon';

import { dashToCamel } from './utils';
import { COMPONENT, OBSERVER } from './symbols';

// BUG: Babel transpiled class breaks native custom elements
function HTMLBridge(...args) { return Reflect.construct(HTMLElement, args, this.constructor); }
Object.setPrototypeOf(HTMLBridge.prototype, HTMLElement.prototype);

export default class HTMLWrapper extends HTMLBridge {
  constructor() {
    super();

    const component = new this.constructor.Component();
    Object.defineProperty(this, COMPONENT, { value: component });

    this.constructor.plugins.forEach((fn) => { fn(this, component); });
  }

  connectedCallback() {
    const component = this[COMPONENT];
    if (component.connected) {
      component.connected(this);
    }

    this.dispatchEvent(new CustomEvent('@connect'));

    if (!this[OBSERVER]) {
      Object.defineProperty(this, OBSERVER, {
        value: new Observer(component, Object.keys(component), (changelog) => {
          let result;
          if (component.updated) {
            result = component.updated({ host: this, changelog });
          }

          if (result !== false) {
            this.dispatchEvent(new CustomEvent('@update', {
              detail: changelog,
              bubbles: true,
            }));
          }
        }),
      });
    }
  }

  disconnectedCallback() {
    if (this[COMPONENT].disconnected) {
      this[COMPONENT].disconnected(this);
    }

    this.dispatchEvent(new CustomEvent('@disconnect'));
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    const property = dashToCamel(attrName);

    newVal = newVal !== null ? newVal : false;
    const newPropValue = newVal !== '' ? newVal : true;

    this[property] = newPropValue;
  }
}

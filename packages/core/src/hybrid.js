import { error } from './debug';
import { proxy } from './proxy';
import { dashToCamel, reflectValue, queue } from './utils';
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

    this.constructor[OPTIONS].properties.forEach(({ property, attr }) => {
      if (!Reflect.has(this[CONTROLLER], property)) {
        error(TypeError, "hybrid: Public property '%property' must be defined", { property });
      }

      let value = this[CONTROLLER][property];
      const reflectType = typeof value;

      if (reflectType === 'boolean') {
        Object.defineProperty(this[CONTROLLER], property, {
          get() { return value; },
          set: (newVal) => {
            value = newVal;
            if (typeof newVal === 'boolean') {
              Promise.resolve().then(() => {
                if (value) {
                  if (!this.hasAttribute(attr)) this.setAttribute(attr, '');
                } else if (this.hasAttribute(attr)) {
                  this.removeAttribute(attr);
                }
              });
            }
          },
          enumerable: true
        });
      }

      let defaultValue;
      if ({}.hasOwnProperty.call(this, property)) defaultValue = this[property];

      Object.defineProperty(this, property, {
        get() { return this[CONTROLLER][property]; },
        set(newVal) { this[CONTROLLER][property] = reflectValue(newVal, reflectType); },
      });

      if (defaultValue !== undefined) this[property] = defaultValue;
    });

    this.constructor[PROVIDERS].map(m => m(this, this[CONTROLLER]));
  }

  connectedCallback() {
    if (this[CONTROLLER].connect) this[CONTROLLER].connect();
    dispatchEvent(this, 'hybrid-connect', { bubbles: false });
  }

  disconnectedCallback() {
    if (this[CONTROLLER].disconnect) this[CONTROLLER].disconnect();
    dispatchEvent(this, 'hybrid-disconnect', { bubbles: false });
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    const property = dashToCamel(attrName);

    newVal = newVal !== null ? newVal : false;
    const newPropValue = newVal !== '' ? newVal : true;

    if (newPropValue !== this[property]) queue(() => (this[property] = newPropValue));
  }

  get [Symbol.toStringTag]() { return 'HTMLHybridElement'; }
}

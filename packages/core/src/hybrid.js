import { warning, error } from '@hybrids/debug';

import { proxy } from './proxy';
import { dashToCamel } from './utils';
import { CONTROLLER, MIDDLEWARE, OPTIONS } from './symbols';

function HTMLBridge(...args) {
  return Reflect.construct(HTMLElement, args, this.constructor);
}
Object.setPrototypeOf(HTMLBridge.prototype, HTMLElement.prototype);

export default class Hybrid extends HTMLBridge {
  static get [CONTROLLER]() { return Object; }
  static get [MIDDLEWARE]() { return []; }
  static get [OPTIONS]() { return { properties: [] }; }

  constructor() {
    super();

    Object.defineProperty(this, CONTROLLER, {
      value: proxy(this, () => new this.constructor[CONTROLLER]()),
    });

    Object.defineProperty(this, MIDDLEWARE, {
      value: this.constructor[MIDDLEWARE].map(m => m(this)).filter(m => m),
    });

    this.constructor[OPTIONS].properties.forEach(({ property }) => {
      if (!Reflect.has(this[CONTROLLER], property)) {
        error(ReferenceError, "'%s': public property must be defined", property);
      }
    });
  }

  connectedCallback() {
    this.constructor[OPTIONS].properties.forEach(({ property }) => {
      const value = this[property];

      if ({}.hasOwnProperty.call(this, property)) {
        delete this[property];
        this[property] = value;
      }

      this[property] = value;
    });

    if (this[CONTROLLER].connected) this[CONTROLLER].connected();

    this[MIDDLEWARE].forEach((middleware) => {
      if (middleware.connected) middleware.connected();
    });
  }

  disconnectedCallback() {
    if (this[CONTROLLER].disconnected) this[CONTROLLER].disconnected();

    this[MIDDLEWARE].forEach((middleware) => {
      if (middleware.disconnected) middleware.disconnected();
    });
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    const property = dashToCamel(attrName);

    try {
      const value = newVal !== null ? newVal : false;
      this[property] = value !== '' ? value : true;
    } catch (e) {
      warning(e, "reflect attribute '%s' to property '%s'", attrName, property);
    }
  }

  get [Symbol.toStringTag]() { return 'HTMLHybridElement'; }
}

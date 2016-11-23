import { Observer } from 'papillon/papillon';
import { warning, error } from '@hybrids/debug';

import { proxy } from './proxy';
import { dashToCamel } from './utils';
import { dispatchEvent } from './plugins/dispatch-event';
import { CONTROLLER, MIDDLEWARE, OPTIONS, OBSERVER } from './symbols';

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

    this[OBSERVER] = new Observer(this[CONTROLLER], Object.keys(this[CONTROLLER]), (changelog) => {
      if (this.shadowRoot) dispatchEvent.call(this.shadowRoot, 'change', { changelog });

      const shouldEmit = Object.keys(changelog).some(key =>
        this.constructor[OPTIONS].properties.find(({ property }) => property === key)
      );

      if (shouldEmit) dispatchEvent.call(this, 'change');
    });
  }

  disconnectedCallback() {
    if (this[CONTROLLER].disconnected) this[CONTROLLER].disconnected();

    this[MIDDLEWARE].forEach((middleware) => {
      if (middleware.disconnected) middleware.disconnected();
    });

    this[OBSERVER].destroy();
    this[OBSERVER] = null;
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

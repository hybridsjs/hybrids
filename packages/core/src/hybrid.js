import { Observer } from 'papillon/papillon';
import { warning, error } from '@hybrids/debug';

import { proxy } from './proxy';
import { dashToCamel } from './utils';
import { dispatchEvent } from './plugins/dispatch-event';
import { CONTROLLER, PROVIDERS, OPTIONS, OBSERVER, CONNECTED } from './symbols';

function HTMLBridge(...args) {
  return Reflect.construct(HTMLElement, args, this.constructor);
}
Object.setPrototypeOf(HTMLBridge.prototype, HTMLElement.prototype);

export default class Hybrid extends HTMLBridge {
  static get [CONTROLLER]() { return Object; }
  static get [PROVIDERS]() { return []; }
  static get [OPTIONS]() { return { properties: [] }; }

  constructor() {
    super();

    Object.defineProperty(this, CONNECTED, { value: false, configurable: true });

    Object.defineProperty(this, CONTROLLER, {
      value: proxy(this, () => new this.constructor[CONTROLLER]()),
    });

    Object.defineProperty(this, PROVIDERS, {
      value: this.constructor[PROVIDERS].map(m => m(this)).filter(m => m),
    });

    this.constructor[OPTIONS].properties.forEach(({ property }) => {
      if (!Reflect.has(this[CONTROLLER], property)) {
        error(ReferenceError, 'public property must be defined: %s', property);
      }
    });
  }

  connectedCallback() {
    Object.defineProperty(this, CONNECTED, { value: true, configurable: true });

    const publicProperties = new Set(this.constructor[OPTIONS].properties.map(({ property }) => {
      const value = this[property];

      if ({}.hasOwnProperty.call(this, property)) {
        delete this[property];
        this[property] = value;
      }

      this[property] = value;

      return property;
    }));

    if (this[CONTROLLER].connected) this[CONTROLLER].connected();

    this[PROVIDERS].forEach((provider) => {
      if (provider.connected) provider.connected();
    });

    Object.defineProperty(this, OBSERVER, {
      value: new Observer(this[CONTROLLER], Object.keys(this[CONTROLLER]), (changelog) => {
        if (this[CONTROLLER].changed) this[CONTROLLER].changed(changelog);

        this[PROVIDERS].forEach((provider) => {
          if (provider.changed) provider.changed(changelog);
        });

        if (Object.keys(changelog).some(key => publicProperties.has(key))) {
          let parent = this.parentNode;
          let host;
          while (parent && !host) {
            host = parent.host;
            parent = parent.parentNode;
          }

          if (host && host[OBSERVER]) host[OBSERVER].check();

          dispatchEvent.call(this, 'change');
        }
      }),
      configurable: true,
    });
  }

  disconnectedCallback() {
    Object.defineProperty(this, CONNECTED, { value: false, configurable: true });

    if (this[CONTROLLER].disconnected) this[CONTROLLER].disconnected();

    this[PROVIDERS].forEach((provider) => {
      if (provider.disconnected) provider.disconnected();
    });

    this[OBSERVER].destroy();
    Object.defineProperty(this, OBSERVER, { value: null, configurable: true });
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

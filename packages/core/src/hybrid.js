import { PropertyObserver } from 'papillon';
import { error } from '@hybrids/debug';

import { proxy } from './proxy';
import { dashToCamel, reflectBoolAttribute, queue, shedule } from './utils';
import { dispatchEvent } from './plugins/dispatch-event';

import { CONTROLLER, PROVIDERS, OPTIONS, UPDATE } from './symbols';

// BUG: Babel transpiled class breaks native custom elements
function HTMLBridge(...args) { return Reflect.construct(HTMLElement, args, this.constructor); }
Object.setPrototypeOf(HTMLBridge.prototype, HTMLElement.prototype);

export default class Hybrid extends HTMLBridge {
  constructor() {
    super();

    Object.defineProperty(this, CONTROLLER, {
      value: proxy(this, () => new this.constructor[CONTROLLER]()),
    });

    Object.defineProperty(this, PROVIDERS, {
      value: this.constructor[PROVIDERS].map(m => m(this)).filter(m => m),
    });

    const updates = this[PROVIDERS].filter(p => p.update);
    const callback = () => updates.forEach(p => p.update());

    Object.defineProperty(this, UPDATE, {
      value: () => shedule(callback),
    });

    // BUG: https://github.com/webcomponents/custom-elements/issues/17
    Promise.resolve()
      .then(() => dispatchEvent.call(this, 'upgrade', { bubbles: false }))
      .catch((e) => { throw e; });
  }

  connectedCallback() {
    this.constructor[OPTIONS].properties.forEach(({ property, attr, reflect }) => {
      if (attr && reflect) {
        new PropertyObserver(this[CONTROLLER], property).observe(
          () => {}, reflectBoolAttribute.bind(this, attr)
        );

        reflectBoolAttribute.call(this, attr, this[property]);
      }

      if ({}.hasOwnProperty.call(this, property)) {
        const value = this[property];
        delete this[property];
        this[property] = value;
      }
    });

    if (this[CONTROLLER].connect) this[CONTROLLER].connect();
    this[PROVIDERS].forEach((p) => { if (p.connect) p.connect(); });

    this[UPDATE]();
  }

  disconnectedCallback() {
    if (this[CONTROLLER].disconnect) this[CONTROLLER].disconnect();
    this[PROVIDERS].forEach((p) => { if (p.disconnect) p.disconnect(); });
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    const property = dashToCamel(attrName);

    newVal = newVal !== null ? newVal : false;
    const newPropValue = newVal !== '' ? newVal : true;

    if (newPropValue !== this[property]) queue(() => (this[property] = newPropValue));
  }

  get [Symbol.toStringTag]() { return 'HTMLHybridElement'; }
}

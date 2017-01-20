import { define } from '@hybrids/core';
import engine from '../src/engine';

describe('Engine | Provider -', () => {
  let el;

  beforeAll(() => {
    define('hybrids-engine-test', class Controller {
      static get options() {
        return {
          providers: [engine],
          properties: ['test'],
          template: `
            <div>{{ test }}</div>
          `
        };
      }

      constructor() {
        this.test = 'testing content';
      }
    });
  });

  beforeEach(() => {
    el = document.createElement('hybrids-engine-test');
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  rafIt('renders view', () => {
    requestAnimationFrame(() => {
      expect(el.shadowRoot.children[0].textContent.trim()).toEqual('testing content');
    });
  });

  rafIt('updates by property', () => {
    el.test = 'new value';
    requestAnimationFrame(() => {
      expect(el.shadowRoot.children[0].textContent.trim()).toEqual('new value');
    });
  });

  rafIt('throw when no template given', () => {
    expect(() => {
      define('hybrids-engine-throw', class {
        static get options() { return { providers: [engine] }; }
      });
    }).toThrow();
  });
});

import { define } from '@hybrids/core';
import engine from '../src/engine';

describe('Engine | Provider -', () => {
  let el;

  beforeAll(() => {
    define('hybrids-engine-test', class Controller {
      static get options() {
        return {
          use: [engine],
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
    expect(el.shadowRoot.children[0].textContent.trim()).toEqual('testing content');
  });

  rafIt('updates view', () => {
    el.test = 'new value';
    requestAnimationFrame(() => {
      expect(el.shadowRoot.children[0].textContent.trim()).toEqual('new value');
    });
  });
});

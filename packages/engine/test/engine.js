import { define } from '@hybrids/core';
import engine from '../src/engine';

describe('Engine | Middleware -', () => {
  let el;
  let content;

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
    content = el.shadowRoot.children[0];

    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  it('renders view', () => {
    expect(content.textContent.trim()).toEqual('testing content');
  });

  it('updates view', (done) => {
    window.requestAnimationFrame(() => {
      el.test = 'new value';
      window.requestAnimationFrame(() => {
        expect(content.textContent.trim()).toEqual('new value');
        done();
      });
    });
  });
});

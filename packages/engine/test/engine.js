import { define } from '@hybrids/core';
import engine from '../src/engine';

describe('engine', () => {
  let el;
  let content;

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

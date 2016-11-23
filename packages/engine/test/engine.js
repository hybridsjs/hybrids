import { define, CONTROLLER } from '@hybrids/core';
import engine from '../src/engine';

fdescribe('engine', () => {
  let el;
  let content;
  // let ctrl;

  define('hybrids-engine-test', class Controller {
    static get options() {
      return {
        use: [engine],
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
    // ctrl = el[CONTROLLER];
    content = el.shadowRoot.children[0];

    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  it('renders view', () => {
    expect(content.textContent.trim()).toEqual('testing content');
  });

  it('updates view', () => {
    el.test = 'new value';
    window.requestAnimationFrame(() => {
      expect(content.textContent.trim()).toEqual('new value');
    });
  });
});

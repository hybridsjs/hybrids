import { define } from '@hybrids/core';
import engine from '../../src/engine';
import { LOCALS_PREFIX as L } from '../../src/expression';
import { MARKER_PREFIX as M, TEMPLATE_PREFIX as T } from '../../src/template';

describe('engine | markers | if -', () => {
  let el;

  afterEach(() => {
    document.body.removeChild(el);
  });

  class EngineIfTest {
    static get options() {
      return {
        plugins: [engine],
        properties: ['items', 'show'],
        template: `
          <template ${M}if="show">
            <div ${T}for="items">{{ ${L}item }}</div>
          </template>
        `
      };
    }

    constructor() {
      this.show = true;
      this.items = ['4', '2', '3', '1'];
    }
  }

  beforeAll(() => {
    define({ EngineIfTest });
  });

  beforeEach(() => {
    el = document.createElement('engine-if-test');
    document.body.appendChild(el);
  });

  rafIt('renders elements', () => {
    requestAnimationFrame(() => {
      expect(el.shadowRoot.children.length).toEqual(4);
    });
  });

  rafIt('removes elements', () => {
    el.show = false;
    requestAnimationFrame(() => {
      expect(el.shadowRoot.children.length).toEqual(0);
    });
  });

  it('rerender removed nested elements', (done) => {
    requestAnimationFrame(() => {
      el.show = false;
      requestAnimationFrame(() => {
        el.show = true;
        requestAnimationFrame(() => {
          expect(el.shadowRoot.children.length).toEqual(4);
          done();
        });
      });
    });
  });
});

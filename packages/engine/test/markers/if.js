import { define } from '@hybrids/core';
import engine from '../../src/engine';
import { LOCALS_PREFIX as L } from '../../src/expression';
import { MARKER_PREFIX as M, TEMPLATE_PREFIX as T } from '../../src/template';

describe('Engine | Markers | If -', () => {
  let el;

  afterEach(() => {
    document.body.removeChild(el);
  });

  class EngineIfTest {
    static get options() {
      return {
        providers: [engine],
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

  rafIt('render elements', () => {
    requestAnimationFrame(() => {
      expect(el.shadowRoot.children.length).toEqual(4);
    });
  });

  rafIt('remove elements', () => {
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

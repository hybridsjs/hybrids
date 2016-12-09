import { define } from '@hybrids/core';
import engine from '../../src/engine';
import { MARKER_PREFIX as M } from '../../src/template';

describe('Engine | Markers | If -', () => {
  let el;

  afterEach(() => {
    document.body.removeChild(el);
  });

  class EngineIfTest {
    static get options() {
      return {
        use: [engine],
        properties: ['items', 'show'],
        template: `
          <template ${M}if="show">
            <div ${M}${M}for="items">{{ @item }}</div>
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
    expect(el.shadowRoot.children.length).toEqual(4);
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

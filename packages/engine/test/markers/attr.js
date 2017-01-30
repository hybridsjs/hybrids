import { define, CONTROLLER } from '@hybrids/core';
import engine from '../../src/engine';

import { MARKER_PREFIX as M } from '../../src/template';

describe('Engine | Markers | Attr -', () => {
  let el;

  beforeAll(() => {
    class EngineMarkersAttrTest {
      static get options() {
        return {
          plugins: [engine],
          template: `
            <div id="one" ${M}attr="customAttr: data.text"></div>
            <div id="two" ${M}attr="with-dash: data.number"></div>
            <div id="three" ${M}attr="OTHER: data.bool"></div>
          `
        };
      }

      constructor() {
        this.data = {
          text: 'text',
          number: 123,
          bool: true
        };
      }
    }

    define({ EngineMarkersAttrTest });
  });

  beforeEach(() => {
    el = document.createElement('engine-markers-attr-test');
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  function getId(id) {
    return el.shadowRoot.querySelector(`#${id}`);
  }

  rafIt('set text to attribute', () => {
    requestAnimationFrame(() => {
      expect(getId('one').getAttribute('customattr')).toEqual('text');
    });
  });

  rafIt('set number to attribute', () => {
    requestAnimationFrame(() => {
      expect(getId('two').getAttribute('with-dash')).toEqual('123');
    });
  });

  rafIt('set bool to attribute', () => {
    requestAnimationFrame(() => {
      expect(getId('three').hasAttribute('other')).toEqual(true);
      expect(getId('three').getAttribute('other')).toEqual('');
    });
  });

  it('removes attribute when false', (done) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el[CONTROLLER].data.bool = false;
        requestAnimationFrame(() => {
          expect(getId('three').hasAttribute('other')).toEqual(false);
          done();
        });
      });
    });
  });
});

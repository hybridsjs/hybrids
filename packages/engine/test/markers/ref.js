import { define, CONTROLLER } from '@hybrids/core';
import engine from '../../src/engine';

import { MARKER_PREFIX as M } from '../../src/template';

describe('Engine | Markers | Ref -', () => {
  let el;

  beforeAll(() => {
    class EngineMarkersRefTest {
      static get options() {
        return {
          plugins: [engine],
          template: `
            <div id="one" ${M}ref="div"></div>
          `
        };
      }

      constructor() {
        this.div = null;
      }
    }

    define({ EngineMarkersRefTest });
  });

  beforeEach(() => {
    el = document.createElement('engine-markers-ref-test');
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  function getId(id) {
    return el.shadowRoot.querySelector(`#${id}`);
  }

  rafIt('set element ref', () => {
    expect(el[CONTROLLER].div).toEqual(getId('one'));
  });
});

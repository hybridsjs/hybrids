import { define, CONTROLLER } from '@hybrids/core';
import engine from '../../src/engine';

import { MARKER_PREFIX as M } from '../../src/template';

describe('Engine | Markers | Style -', () => {
  let el;
  let ctrl;

  beforeAll(() => {
    class EngineMarkersStyleTest {
      static get options() {
        return {
          providers: [engine],
          template: `
              <div id="simple" ${M}style="background-color: style.backgroundColor; color: style.color"></div>
              <div id="list" ${M}style="style"></div>
            `
        };
      }

      constructor() {
        this.style = {
          backgroundColor: 'rgb(255, 0, 0)',
          color: 'rgb(255, 255, 0)',
        };
      }
    }

    define({ EngineMarkersStyleTest });
  });

  beforeEach(() => {
    el = document.createElement('engine-markers-style-test');
    ctrl = el[CONTROLLER];
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  function getComputedStyle(id) {
    return window.getComputedStyle(el.shadowRoot.querySelector(`#${id}`));
  }

  rafIt('set simple', () => {
    requestAnimationFrame(() => {
      const style = getComputedStyle('simple');
      expect(style.backgroundColor).toEqual('rgb(255, 0, 0)');
      expect(style.color).toEqual('rgb(255, 255, 0)');
    });
  });

  rafIt('update simple', () => {
    ctrl.style.backgroundColor = 'rgb(0, 0, 255)';
    delete ctrl.style.color;
    requestAnimationFrame(() => {
      const style = getComputedStyle('simple');
      expect(style.backgroundColor).toEqual('rgb(0, 0, 255)');
      expect(style.color).toEqual('rgb(0, 0, 0)');
    });
  });

  rafIt('set list', () => {
    requestAnimationFrame(() => {
      const style = getComputedStyle('list');
      expect(style.backgroundColor).toEqual('rgb(255, 0, 0)');
      expect(style.color).toEqual('rgb(255, 255, 0)');
    });
  });

  rafIt('update list', () => {
    ctrl.style.backgroundColor = 'rgb(0, 0, 255)';
    delete ctrl.style.color;

    requestAnimationFrame(() => {
      const style = getComputedStyle('list');
      expect(style.backgroundColor).toEqual('rgb(0, 0, 255)');
      expect(style.color).toEqual('rgb(0, 0, 0)');
    });
  });

  rafIt('clear list', () => {
    ctrl.style = null;

    requestAnimationFrame(() => {
      expect(el.shadowRoot.querySelector('#list').hasAttribute('style')).toEqual(false);
    });
  });
});

import { define, CONTROLLER } from '@hybrids/core';
import engine from '../../src/engine';

import { MARKER_PREFIX as M } from '../../src/template';

describe('engine | markers | style -', () => {
  let el;
  let ctrl;

  beforeAll(() => {
    class EngineMarkersStyleTest {
      static get options() {
        return {
          plugins: [engine],
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

  rafIt('sets simple', () => {
    requestAnimationFrame(() => {
      const style = getComputedStyle('simple');
      expect(style.backgroundColor).toEqual('rgb(255, 0, 0)');
      expect(style.color).toEqual('rgb(255, 255, 0)');
    });
  });

  rafIt('updates simple', () => {
    ctrl.style.backgroundColor = 'rgb(0, 0, 255)';
    delete ctrl.style.color;
    requestAnimationFrame(() => {
      const style = getComputedStyle('simple');
      expect(style.backgroundColor).toEqual('rgb(0, 0, 255)');
      expect(style.color).toEqual('rgb(0, 0, 0)');
    });
  });

  rafIt('sets list', () => {
    requestAnimationFrame(() => {
      const style = getComputedStyle('list');
      expect(style.backgroundColor).toEqual('rgb(255, 0, 0)');
      expect(style.color).toEqual('rgb(255, 255, 0)');
    });
  });

  rafIt('updates list', () => {
    ctrl.style.backgroundColor = 'rgb(0, 0, 255)';
    delete ctrl.style.color;

    requestAnimationFrame(() => {
      const style = getComputedStyle('list');
      expect(style.backgroundColor).toEqual('rgb(0, 0, 255)');
      expect(style.color).toEqual('rgb(0, 0, 0)');
    });
  });

  rafIt('clears list', () => {
    ctrl.style = null;

    requestAnimationFrame(() => {
      expect(!!el.shadowRoot.querySelector('#list').getAttribute('style')).toEqual(false);
    });
  });
});

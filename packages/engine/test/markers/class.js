import { define, CONTROLLER } from '@hybrids/core';
import engine from '../../src/engine';

import { MARKER_PREFIX as M } from '../../src/template';

describe('engine | markers | class -', () => {
  let el;
  let ctrl;

  beforeAll(() => {
    class EngineMarkersClassTest {
      static get options() {
        return {
          plugins: [engine],
          template: `
            <div id="simple" ${M}class="one: keys.one; two: keys.two"></div>
            <div id="keys" ${M}class="keys"></div>
            <div id="array" ${M}class="array"></div>
          `
        };
      }

      constructor() {
        this.keys = {
          one: true,
          two: false,
          three: true,
        };
        this.array = ['one', 'two'];
      }
    }

    define({ EngineMarkersClassTest });
  });

  beforeEach(() => {
    el = document.createElement('engine-markers-class-test');
    ctrl = el[CONTROLLER];
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  function getId(id) {
    return el.shadowRoot.querySelector(`#${id}`);
  }

  rafIt('sets simple', () => {
    requestAnimationFrame(() => {
      expect(getId('simple').classList.contains('one')).toEqual(true);
      expect(getId('simple').classList.contains('two')).toEqual(false);
    });
  });

  rafIt('updates simple', () => {
    delete ctrl.keys.one;
    ctrl.keys.two = true;
    ctrl.keys.three = false;

    const simple = getId('simple');
    requestAnimationFrame(() => {
      expect(simple.classList.contains('one')).toEqual(false);
      expect(simple.classList.contains('two')).toEqual(true);
      expect(simple.classList.contains('three')).toEqual(false);
    });
  });

  rafIt('sets keys', () => {
    requestAnimationFrame(() => {
      const keys = getId('keys');
      expect(keys.classList.contains('one')).toEqual(true);
      expect(keys.classList.contains('two')).toEqual(false);
    });
  });

  rafIt('updates keys', () => {
    delete ctrl.keys.one;
    ctrl.keys.two = true;
    ctrl.keys.three = true;
    const keys = getId('keys');
    requestAnimationFrame(() => {
      expect(keys.classList.contains('one')).toEqual(false);
      expect(keys.classList.contains('two')).toEqual(true);
      expect(keys.classList.contains('three')).toEqual(true);
    });
  });

  rafIt('clears keys', () => {
    ctrl.keys = null;
    const keys = getId('keys');
    requestAnimationFrame(() => {
      expect(keys.classList.contains('one')).toEqual(false);
      expect(keys.classList.contains('two')).toEqual(false);
      expect(keys.classList.contains('three')).toEqual(false);
    });
  });

  rafIt('sets array', () => {
    requestAnimationFrame(() => {
      const keys = getId('array');
      expect(keys.classList.contains('one')).toEqual(true);
      expect(keys.classList.contains('two')).toEqual(true);
    });
  });

  rafIt('removes item in array', () => {
    ctrl.array.splice(1, 1);

    requestAnimationFrame(() => {
      const array = getId('array');
      expect(array.classList.contains('one')).toEqual(true);
      expect(array.classList.contains('two')).toEqual(false);
    });
  });

  rafIt('sets item in array', () => {
    ctrl.array[0] = 'new-value';

    requestAnimationFrame(() => {
      const array = getId('array');
      expect(array.classList.contains('new-value')).toEqual(true);
      expect(array.classList.contains('one')).toEqual(false);
    });
  });

  rafIt('adds item in array', () => {
    ctrl.array.push('new-value');

    requestAnimationFrame(() => {
      const array = getId('array');
      expect(array.classList.contains('one')).toEqual(true);
      expect(array.classList.contains('two')).toEqual(true);
      expect(array.classList.contains('new-value')).toEqual(true);
    });
  });

  rafIt('clears array', () => {
    ctrl.array = 0;
    requestAnimationFrame(() => {
      const array = getId('array');
      expect(array.classList.contains('one')).toEqual(false);
      expect(array.classList.contains('two')).toEqual(false);
    });
  });
});

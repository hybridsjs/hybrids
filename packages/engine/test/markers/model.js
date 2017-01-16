import { define, CONTROLLER } from '@hybrids/core';
import { dispatchEvent } from '@hybrids/core/src/plugins/dispatch-event';

import engine from '../../src/engine';
import { MARKER_PREFIX as M } from '../../src/template';

describe('Engine | Markers | Model -', () => {
  class EngineLinkTest {
    static get options() {
      return {
        providers: [engine],
        template: `
          <input id="radio1" ${M}model="data.radio" type="radio" value="one" />
          <input id="radio2" ${M}model="data.radio" type="radio" value="two" />
          <input id="checkbox1" ${M}model="data.checkbox" type="checkbox" value="some value" />
          <input id="checkbox2" ${M}model="data.checkbox" type="checkbox" value="other value" />
          <input id="checkbox3" ${M}model="data.checkboxBool" type="checkbox" />
          <input id="text" ${M}model="data.text" type="text" />

          <my-element id="custom" ${M}model="data.custom"></my-element>

          <select id="select1" ${M}model="data.select1">
            <option>one</option>
            <option>two</option>
          </select>

          <select id="select2" ${M}model="data.select2" multiple>
            <option>one</option>
            <option>two</option>
          </select>
        `
      };
    }

    constructor() {
      this.test = {};
      this.data = { test: this.test };
    }

    modify() {
      this.data.test.property += 'asd';
    }
  }

  let el;
  let ctrl;

  beforeAll(() => {
    define({ EngineLinkTest });
  });

  beforeEach(() => {
    el = document.createElement('engine-link-test');
    document.body.appendChild(el);
    ctrl = el[CONTROLLER];
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  function getId(id) {
    return el.shadowRoot.querySelector(`#${id}`);
  }

  describe('radio', () => {
    rafIt('set one value from radio', () => {
      getId('radio2').click();
      getId('radio1').click();
      requestAnimationFrame(() => {
        expect(ctrl.data.radio).toEqual('one');
      });
    });

    rafIt('set other one value from radio', () => {
      getId('radio1').click();
      getId('radio2').click();
      requestAnimationFrame(() => {
        expect(ctrl.data.radio).toEqual('two');
      });
    });

    rafIt('set one value to radio', () => {
      ctrl.data.radio = 'one';
      requestAnimationFrame(() => {
        expect(getId('radio1').checked).toEqual(true);
        expect(getId('radio2').checked).toEqual(false);
      });
    });
  });

  describe('checkbox', () => {
    rafIt('set one value from checkbox', () => {
      getId('checkbox1').click();
      requestAnimationFrame(() => {
        expect(ctrl.data.checkbox).toEqual(['some value']);
      });
    });

    rafIt('set other one value from checkbox', () => {
      getId('checkbox2').click();
      requestAnimationFrame(() => {
        expect(ctrl.data.checkbox).toEqual(['other value']);
      });
    });

    it('unset one value from checkbox', (done) => {
      requestAnimationFrame(() => {
        const checkbox = getId('checkbox1');
        checkbox.click();
        requestAnimationFrame(() => {
          checkbox.click();
          requestAnimationFrame(() => {
            expect(ctrl.data.checkbox).toEqual([]);
            done();
          });
        });
      });
    });

    rafIt('set one value to checkbox', () => {
      ctrl.data.checkbox = ['some value'];
      requestAnimationFrame(() => {
        expect(getId('checkbox1').checked).toEqual(true);
        expect(getId('checkbox2').checked).toEqual(false);
      });
    });

    rafIt('set multi values from checkbox', () => {
      getId('checkbox1').click();
      getId('checkbox2').click();
      requestAnimationFrame(() => {
        expect(ctrl.data.checkbox).toEqual(['some value', 'other value']);
      });
    });

    it('unset one of multi value from checkbox', (done) => {
      requestAnimationFrame(() => {
        getId('checkbox1').click();
        getId('checkbox2').click();
        requestAnimationFrame(() => {
          getId('checkbox1').click();
          requestAnimationFrame(() => {
            expect(ctrl.data.checkbox).toEqual(['other value']);
            done();
          });
        });
      });
    });

    it('unset all of multi value from checkbox', (done) => {
      requestAnimationFrame(() => {
        getId('checkbox1').click();
        getId('checkbox2').click();
        requestAnimationFrame(() => {
          getId('checkbox1').click();
          getId('checkbox2').click();
          requestAnimationFrame(() => {
            expect(ctrl.data.checkbox).toEqual([]);
            done();
          });
        });
      });
    });

    rafIt('not set one multi value from checkbox', () => {
      ctrl.data.checkbox = ['some value'];
      getId('checkbox1').click();
      requestAnimationFrame(() => {
        expect(ctrl.data.checkbox).toEqual(['some value']);
      });
    });

    it('not unset one multi value from checkbox', (done) => {
      ctrl.data.checkbox = [];
      requestAnimationFrame(() => {
        getId('checkbox1').click();
        getId('checkbox1').click();
        requestAnimationFrame(() => {
          expect(ctrl.data.checkbox).toEqual([]);
          done();
        });
      });
    });

    rafIt('set one multi value to checkbox', () => {
      ctrl.data.checkbox = ['some value'];
      requestAnimationFrame(() => {
        expect(getId('checkbox1').checked).toEqual(true);
        expect(getId('checkbox2').checked).toEqual(false);
      });
    });

    rafIt('set all multi value to checkbox', () => {
      ctrl.data.checkbox = ['other value', 'some value'];
      requestAnimationFrame(() => {
        expect(getId('checkbox1').checked).toEqual(true);
        expect(getId('checkbox2').checked).toEqual(true);
      });
    });

    rafIt('set bool value from checkbox', () => {
      getId('checkbox3').click();
      requestAnimationFrame(() => {
        expect(ctrl.data.checkboxBool).toEqual(true);
      });
    });

    it('unset bool value from checkbox', (done) => {
      requestAnimationFrame(() => {
        const checkbox = getId('checkbox3');
        checkbox.click();
        requestAnimationFrame(() => {
          checkbox.click();
          requestAnimationFrame(() => {
            expect(ctrl.data.checkboxBool).toEqual(false);
            done();
          });
        });
      });
    });
  });

  describe('select', () => {
    rafIt('set one value from select', () => {
      const select = getId('select1');
      select.options[0].selected = true;
      select.options[1].selected = true;
      dispatchEvent(select, 'change');
      requestAnimationFrame(() => {
        expect(ctrl.data.select1).toEqual('two');
      });
    });

    rafIt('set one value to select', () => {
      ctrl.data.select1 = 'two';
      requestAnimationFrame(() => {
        expect(getId('select1').value).toEqual('two');
      });
    });

    rafIt('set one multi value from select', () => {
      const select = getId('select2');
      select.options[0].selected = true;
      dispatchEvent(select, 'change');
      requestAnimationFrame(() => {
        expect(ctrl.data.select2).toEqual(['one']);
      });
    });

    rafIt('set two multi value from select', () => {
      const select = getId('select2');
      select.options[0].selected = true;
      select.options[1].selected = true;
      dispatchEvent(select, 'change');
      requestAnimationFrame(() => {
        expect(ctrl.data.select2).toEqual(['one', 'two']);
      });
    });

    rafIt('set two multi value from select with predefined value', () => {
      const select = getId('select2');
      ctrl.data.select2 = [];
      select.options[0].selected = true;
      select.options[1].selected = true;
      dispatchEvent(select, 'change');
      requestAnimationFrame(() => {
        expect(ctrl.data.select2).toEqual(['one', 'two']);
      });
    });

    rafIt('set one multi value to select', () => {
      ctrl.data.select2 = ['two'];
      requestAnimationFrame(() => {
        expect(Array.from(getId('select2').options).map(o => o.selected)).toEqual([false, true]);
      });
    });

    rafIt('set multi value to select', () => {
      ctrl.data.select2 = ['one', 'two'];
      requestAnimationFrame(() => {
        expect(Array.from(getId('select2').options).map(o => o.selected)).toEqual([true, true]);
      });
    });
  });

  describe('text (default)', () => {
    rafIt('set value from text input', () => {
      const input = getId('text');
      input.value = 'test text';
      dispatchEvent(input, 'input');
      requestAnimationFrame(() => {
        expect(ctrl.data.text).toEqual('test text');
      });
    });

    rafIt('set value to text input', () => {
      ctrl.data.text = 'test text';
      requestAnimationFrame(() => {
        expect(getId('text').value).toEqual('test text');
      });
    });
  });

  describe('custom (default)', () => {
    rafIt('set value from custom element', () => {
      const custom = getId('custom');
      const value = { test: 'test' };
      custom.value = value;
      dispatchEvent(custom, 'change');
      requestAnimationFrame(() => {
        expect(ctrl.data.custom).toEqual(value);
      });
    });

    rafIt('set value to custom element', () => {
      ctrl.data.custom = { test: 'test' };
      requestAnimationFrame(() => {
        expect(getId('custom').value).toEqual({ test: 'test' });
      });
    });
  });
});

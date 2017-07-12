describe('Marker Model', () => {
  test(class {
    static component = {
      template: `
        <input id="radio1" model:="data.radio" type="radio" value="one" />
        <input id="radio2" model:="data.radio" type="radio" value="two" />
        <input id="checkbox1" model:="data.checkbox" type="checkbox" value="some value" />
        <input id="checkbox2" model:="data.checkbox" type="checkbox" value="other value" />
        <input id="checkbox3" model:="data.checkboxBool" type="checkbox" />
        <input id="text" model:="data.text" type="text" />

        <my-element id="custom" model:="data.custom"></my-element>

        <select id="select1" model:="data.select1">
          <option>one</option>
          <option>two</option>
        </select>

        <select id="select2" model:="data.select2" multiple>
          <option>one</option>
          <option>two</option>
        </select>
      `,
    }

    constructor() {
      this.test = {};
      this.data = { test: this.test };
    }

    modify() {
      this.data.test.property += 'asd';
    }
  }, {
    'sets one value from radio': (el, component) => {
      getElement(el, 'radio2').click();
      getElement(el, 'radio1').click();
      return (done) => {
        expect(component.data.radio).toEqual('one');
        done();
      };
    },
    'sets other one value from radio': (el, component) => {
      getElement(el, 'radio1').click();
      getElement(el, 'radio2').click();
      return (done) => {
        expect(component.data.radio).toEqual('two');
        done();
      };
    },
    'sets one value to radio': (el, component) => {
      component.data.radio = 'one';
      return (done) => {
        expect(getElement(el, 'radio1').checked).toEqual(true);
        expect(getElement(el, 'radio2').checked).toEqual(false);
        done();
      };
    },
    'sets one value from checkbox': (el, component) => {
      getElement(el, 'checkbox1').click();
      return (done) => {
        expect(component.data.checkbox).toEqual(['some value']);
        done();
      };
    },
    'sets other one value from checkbox': (el, component) => {
      getElement(el, 'checkbox2').click();
      return (done) => {
        expect(component.data.checkbox).toEqual(['other value']);
        done();
      };
    },
    'unsets one value from checkbox': (el, component) => {
      const checkbox = getElement(el, 'checkbox1');
      checkbox.click();
      return (done) => {
        checkbox.click();
        requestAnimationFrame(() => {
          expect(component.data.checkbox).toEqual([]);
          done();
        });
      };
    },
    'sets one value to checkbox': (el, component) => {
      component.data.checkbox = ['some value'];
      return (done) => {
        expect(getElement(el, 'checkbox1').checked).toEqual(true);
        expect(getElement(el, 'checkbox2').checked).toEqual(false);
        done();
      };
    },
    'sets multi values from checkbox': (el, component) => {
      getElement(el, 'checkbox1').click();
      getElement(el, 'checkbox2').click();
      return (done) => {
        expect(component.data.checkbox).toEqual(['some value', 'other value']);
        done();
      };
    },
    'unsets one of multi value from checkbox': (el, component) => {
      getElement(el, 'checkbox1').click();
      getElement(el, 'checkbox2').click();
      return (done) => {
        getElement(el, 'checkbox1').click();
        requestAnimationFrame(() => {
          expect(component.data.checkbox).toEqual(['other value']);
          done();
        });
      };
    },
    'unsets all of multi value from checkbox': (el, component) => {
      getElement(el, 'checkbox1').click();
      getElement(el, 'checkbox2').click();
      return (done) => {
        getElement(el, 'checkbox1').click();
        getElement(el, 'checkbox2').click();
        requestAnimationFrame(() => {
          expect(component.data.checkbox).toEqual([]);
          done();
        });
      };
    },
    'not sets one multi value from checkbox': (el, component) => {
      component.data.checkbox = ['some value'];
      getElement(el, 'checkbox1').click();
      return (done) => {
        expect(component.data.checkbox).toEqual(['some value']);
        done();
      };
    },
    'not unsets one multi value from checkbox': (el, component) => {
      component.data.checkbox = [];
      return (done) => {
        getElement(el, 'checkbox1').click();
        getElement(el, 'checkbox1').click();
        requestAnimationFrame(() => {
          expect(component.data.checkbox).toEqual([]);
          done();
        });
      };
    },
    'sets one multi value to checkbox': (el, component) => {
      component.data.checkbox = ['some value'];
      return (done) => {
        expect(getElement(el, 'checkbox1').checked).toEqual(true);
        expect(getElement(el, 'checkbox2').checked).toEqual(false);

        done();
      };
    },
    'sets all multi value to checkbox': (el, component) => {
      component.data.checkbox = ['other value', 'some value'];
      return (done) => {
        expect(getElement(el, 'checkbox1').checked).toEqual(true);
        expect(getElement(el, 'checkbox2').checked).toEqual(true);
        done();
      };
    },
    'sets bool value from checkbox': (el, component) => {
      getElement(el, 'checkbox3').click();
      return (done) => {
        expect(component.data.checkboxBool).toEqual(true);
        done();
      };
    },
    'unsets bool value from checkbox': (el, component) => {
      const checkbox = getElement(el, 'checkbox3');
      checkbox.click();
      return (done) => {
        checkbox.click();
        requestAnimationFrame(() => {
          expect(component.data.checkboxBool).toEqual(false);
          done();
        });
      };
    },
    'sets one value from select': (el, component) => {
      const select = getElement(el, 'select1');
      select.options[0].selected = true;
      select.options[1].selected = true;
      select.dispatchEvent(new CustomEvent('change'));
      return (done) => {
        expect(component.data.select1).toEqual('two');
        done();
      };
    },
    'sets one value to select': (el, component) => {
      component.data.select1 = 'two';
      return (done) => {
        expect(getElement(el, 'select1').value).toEqual('two');
        done();
      };
    },
    'sets one multi value from select': (el, component) => {
      const select = getElement(el, 'select2');
      select.options[0].selected = true;
      select.dispatchEvent(new CustomEvent('change'));
      return (done) => {
        expect(component.data.select2).toEqual(['one']);
        done();
      };
    },
    'sets two multi value from select': (el, component) => {
      const select = getElement(el, 'select2');
      select.options[0].selected = true;
      select.options[1].selected = true;
      select.dispatchEvent(new CustomEvent('change'));
      return (done) => {
        expect(component.data.select2).toEqual(['one', 'two']);
        done();
      };
    },
    'sets two multi value from select with predefined value': (el, component) => {
      const select = getElement(el, 'select2');
      component.data.select2 = [];
      select.options[0].selected = true;
      select.options[1].selected = true;
      select.dispatchEvent(new CustomEvent('change'));
      return (done) => {
        expect(component.data.select2).toEqual(['one', 'two']);
        done();
      };
    },
    'sets one multi value to select': (el, component) => {
      component.data.select2 = ['two'];
      return (done) => {
        expect(Array.from(getElement(el, 'select2').options).map(o => o.selected)).toEqual([false, true]);
        done();
      };
    },
    'sets multi value to select': (el, component) => {
      component.data.select2 = ['one', 'two'];
      return (done) => {
        expect(Array.from(getElement(el, 'select2').options).map(o => o.selected)).toEqual([true, true]);
        done();
      };
    },
    'sets value from text input': (el, component) => {
      const input = getElement(el, 'text');
      input.value = 'test text';
      input.dispatchEvent(new CustomEvent('input'));
      return (done) => {
        expect(component.data.text).toEqual('test text');
        done();
      };
    },
    'sets value to text input': (el, component) => {
      component.data.text = 'test text';
      return (done) => {
        expect(getElement(el, 'text').value).toEqual('test text');
        done();
      };
    },
    'sets value from custom element': (el, component) => {
      const custom = getElement(el, 'custom');
      const value = { test: 'test' };
      custom.value = value;
      custom.dispatchEvent(new CustomEvent('change'));
      return (done) => {
        expect(component.data.custom).toEqual(value);
        done();
      };
    },
    'sets value to custom element': (el, component) => {
      component.data.custom = { test: 'test' };
      return (done) => {
        expect(getElement(el, 'custom').value).toEqual({ test: 'test' });
        done();
      };
    },
  });
});

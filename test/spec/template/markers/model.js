describe('Marker Model:', () => {
  const test = hybrid(class {
    static view = {
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

      this.data = {
        test: this.test,
        radio: null,
        checkbox: null,
        checkboxBool: null,
        text: '',
        custom: null,
        select1: null,
        select2: [],
      };
    }

    modify() {
      this.data.test.property += 'asd';
    }
  });

  it('sets one value from radio', test(({ component, getElement }) => {
    getElement('radio2').click();
    getElement('radio1').click();
    return (done) => {
      expect(component.data.radio).toEqual('one');
      done();
    };
  }));

  it('sets other one value from radio', test(({ component, getElement }) => {
    getElement('radio1').click();
    getElement('radio2').click();
    return (done) => {
      expect(component.data.radio).toEqual('two');
      done();
    };
  }));

  it('sets one value to radio', test(({ component, getElement }) => {
    component.data.radio = 'one';
    return (done) => {
      expect(getElement('radio1').checked).toEqual(true);
      expect(getElement('radio2').checked).toEqual(false);
      done();
    };
  }));

  it('sets one value from checkbox', test(({ component, getElement }) => {
    getElement('checkbox1').click();
    return (done) => {
      expect(component.data.checkbox).toEqual(['some value']);
      done();
    };
  }));

  it('sets other one value from checkbox', test(({ component, getElement }) => {
    getElement('checkbox2').click();
    return (done) => {
      expect(component.data.checkbox).toEqual(['other value']);
      done();
    };
  }));

  it('unsets one value from checkbox', test(({ component, getElement }) => {
    const checkbox = getElement('checkbox1');
    checkbox.click();
    return (done) => {
      checkbox.click();
      requestAnimationFrame(() => {
        expect(component.data.checkbox).toEqual([]);
        done();
      });
    };
  }));

  it('sets one value to checkbox', test(({ component, getElement }) => {
    component.data.checkbox = ['some value'];
    return (done) => {
      expect(getElement('checkbox1').checked).toEqual(true);
      expect(getElement('checkbox2').checked).toEqual(false);
      done();
    };
  }));

  it('sets multi values from checkbox', test(({ component, getElement }) => {
    getElement('checkbox1').click();
    getElement('checkbox2').click();
    return (done) => {
      expect(component.data.checkbox).toEqual(['some value', 'other value']);
      done();
    };
  }));

  it('unsets one of multi value from checkbox', test(({ component, getElement }) => {
    getElement('checkbox1').click();
    getElement('checkbox2').click();
    return (done) => {
      getElement('checkbox1').click();
      requestAnimationFrame(() => {
        expect(component.data.checkbox).toEqual(['other value']);
        done();
      });
    };
  }));

  it('unsets all of multi value from checkbox', test(({ component, getElement }) => {
    getElement('checkbox1').click();
    getElement('checkbox2').click();
    return (done) => {
      getElement('checkbox1').click();
      getElement('checkbox2').click();
      requestAnimationFrame(() => {
        expect(component.data.checkbox).toEqual([]);
        done();
      });
    };
  }));

  it('not sets one multi value from checkbox', test(({ component, getElement }) => {
    component.data.checkbox = ['some value'];
    getElement('checkbox1').click();
    return (done) => {
      expect(component.data.checkbox).toEqual(['some value']);
      done();
    };
  }));

  it('not unsets one multi value from checkbox', test(({ component, getElement }) => {
    component.data.checkbox = [];
    return (done) => {
      getElement('checkbox1').click();
      getElement('checkbox1').click();
      requestAnimationFrame(() => {
        expect(component.data.checkbox).toEqual([]);
        done();
      });
    };
  }));

  it('sets one multi value to checkbox', test(({ component, getElement }) => {
    component.data.checkbox = ['some value'];
    return (done) => {
      expect(getElement('checkbox1').checked).toEqual(true);
      expect(getElement('checkbox2').checked).toEqual(false);

      done();
    };
  }));

  it('sets all multi value to checkbox', test(({ component, getElement }) => {
    component.data.checkbox = ['other value', 'some value'];
    return (done) => {
      expect(getElement('checkbox1').checked).toEqual(true);
      expect(getElement('checkbox2').checked).toEqual(true);
      done();
    };
  }));

  it('sets bool value from checkbox', test(({ component, getElement }) => {
    getElement('checkbox3').click();
    return (done) => {
      expect(component.data.checkboxBool).toEqual(true);
      done();
    };
  }));

  it('unsets bool value from checkbox', test(({ component, getElement }) => {
    const checkbox = getElement('checkbox3');
    checkbox.click();
    return (done) => {
      checkbox.click();
      requestAnimationFrame(() => {
        expect(component.data.checkboxBool).toEqual(false);
        done();
      });
    };
  }));

  it('sets one value from select', test(({ component, getElement }) => {
    const select = getElement('select1');
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.dispatchEvent(new CustomEvent('change'));
    return (done) => {
      expect(component.data.select1).toEqual('two');
      done();
    };
  }));

  it('sets one value to select', test(({ component, getElement }) => {
    component.data.select1 = 'two';
    return (done) => {
      expect(getElement('select1').value).toEqual('two');
      done();
    };
  }));

  it('sets one multi value from select', test(({ component, getElement }) => {
    const select = getElement('select2');
    select.options[0].selected = true;
    select.dispatchEvent(new CustomEvent('change'));
    return (done) => {
      expect(component.data.select2).toEqual(['one']);
      done();
    };
  }));

  it('sets two multi value from select', test(({ component, getElement }) => {
    const select = getElement('select2');
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.dispatchEvent(new CustomEvent('change'));
    return (done) => {
      expect(component.data.select2).toEqual(['one', 'two']);
      done();
    };
  }));

  it('sets two multi value from select with predefined value', test(({ component, getElement }) => {
    const select = getElement('select2');
    component.data.select2 = [];
    select.options[0].selected = true;
    select.options[1].selected = true;
    select.dispatchEvent(new CustomEvent('change'));
    return (done) => {
      expect(component.data.select2).toEqual(['one', 'two']);
      done();
    };
  }));

  it('sets one multi value to select', test(({ component, getElement }) => {
    component.data.select2 = ['two'];
    return (done) => {
      expect(Array.from(getElement('select2').options).map(o => o.selected)).toEqual([false, true]);
      done();
    };
  }));

  it('sets multi value to select', test(({ component, getElement }) => {
    component.data.select2 = ['one', 'two'];
    return (done) => {
      expect(Array.from(getElement('select2').options).map(o => o.selected)).toEqual([true, true]);
      done();
    };
  }));

  it('sets value from text input', test(({ component, getElement }) => {
    const input = getElement('text');
    input.value = 'test text';
    input.dispatchEvent(new CustomEvent('input'));
    return (done) => {
      expect(component.data.text).toEqual('test text');
      done();
    };
  }));

  it('sets value to text input', test(({ component, getElement }) => {
    component.data.text = 'test text';
    return (done) => {
      expect(getElement('text').value).toEqual('test text');
      done();
    };
  }));

  it('sets value from custom element', test(({ component, getElement }) => {
    const custom = getElement('custom');
    const value = { test: 'test' };
    custom.value = value;
    custom.dispatchEvent(new CustomEvent('change'));
    return (done) => {
      expect(component.data.custom).toEqual(value);
      done();
    };
  }));

  it('sets value to custom element', test(({ component, getElement }) => {
    component.data.custom = { test: 'test' };
    return (done) => {
      expect(getElement('custom').value).toEqual({ test: 'test' });
      done();
    };
  }));
});

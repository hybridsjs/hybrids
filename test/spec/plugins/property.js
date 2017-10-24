import define from '../../../src/define';
import { COMPONENT } from '../../../src/symbols';
import property from '../../../src/plugins/property';

describe('Plugin Property:', () => {
  const test = hybrid(class PropertyBindingTest {
    static plugins = {
      one: property(),
      twoVal: property(Number),
      three: property(Boolean, { attr: false }),
      json: property(JSON.parse),
    };

    constructor() {
      this.one = 'default value';
      this.twoVal = '100';
      this.three = false;
      this.json = null;
    }
  });

  it('set element property', test(({ el }) => {
    expect(el.one).toBe('default value');
  }));

  it('set component value', test(({ el, component }) => {
    el.one = 'new value';
    return (done) => {
      expect(component.one).toBe('new value');
      done();
    };
  }));

  it('use dashed attribute', test(({ el, component }) => {
    el.setAttribute('two-val', '100');
    return (done) => {
      expect(el.twoVal).toBe(100);
      expect(component.twoVal).toBe(100);
      done();
    };
  }));

  it('not use attribute', test(({ el, component }) => {
    el.setAttribute('three', 'three');
    return (done) => {
      expect(component.three).toBe(false);
      done();
    };
  }));

  it('custom Constructor from attribute', test(({ el, component }) => {
    el.setAttribute('json', '{ "test": "test" }');
    return (done) => {
      expect(component.json).toEqual({ test: 'test' });
      done();
    };
  }));

  it('custom Constructor from property as string', test(({ el, component }) => {
    el.json = '{ "test": "test" }';
    return (done) => {
      expect(component.json).toEqual({ test: 'test' });
      done();
    };
  }));

  it('takes property value when element is upgraded', (done) => {
    class DefaultValueTest {
      static plugins = {
        test: property(),
      };

      constructor() {
        this.test = '';
      }
    }

    const el = document.createElement('default-value-test');
    document.body.appendChild(el);
    el.test = 'value';
    define({ DefaultValueTest });

    Promise.resolve().then(() => {
      global.requestAnimationFrame(() => {
        expect(el[COMPONENT].test).toBe('value');
        document.body.removeChild(el);
        done();
      });
    });
  });
});

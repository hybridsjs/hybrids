import define from '../../src/define';
import { COMPONENT } from '../../src/symbols';
import property from '../../src/bindings/property';

describe('Property binding', () => {
  test(
    class PropertyBindingTest {
      static component = {
        bindings: {
          one: property(),
          twoVal: property(Number),
          three: property(Boolean, { attr: false }),
          json: property(JSON.parse),
        },
      };

      constructor() {
        this.one = 'default value';
        this.twoVal = '100';
        this.three = false;
      }
    },
    {
      'set element property': (el) => {
        expect(el.one).toBe('default value');
      },
      'set component value': (el, component) => {
        el.one = 'new value';
        return (done) => {
          expect(component.one).toBe('new value');
          done();
        };
      },
      'use dashed attribute': (el, component) => {
        el.setAttribute('two-val', '100');
        return (done) => {
          expect(el.twoVal).toBe(100);
          expect(component.twoVal).toBe(100);
          done();
        };
      },
      'not use attribute': (el, component) => {
        el.setAttribute('three', 'trhee');
        return (done) => {
          expect(component.three).toBe(false);
          done();
        };
      },
      'custom Constructor from attribute': (el, component) => {
        el.setAttribute('json', '{ "test": "test" }');
        return (done) => {
          expect(component.json).toEqual({ test: 'test' });
          done();
        };
      },
      'custom Constructor from property as string': (el, component) => {
        el.json = '{ "test": "test" }';
        return (done) => {
          expect(component.json).toEqual({ test: 'test' });
          done();
        };
      },
      'custom Constructor from property as object': (el, component) => {
        el.json = { test: 'test' };
        return (done) => {
          expect(component.json).toEqual({ test: 'test' });
          done();
        };
      },
    },
  );

  it('takes property value when element is upgraded', (done) => {
    class DefaultValueTest {
      static component = {
        bindings: {
          test: property(),
        },
      }
    }

    const el = document.createElement('default-value-test');
    document.body.appendChild(el);
    el.test = 'value';
    define({ DefaultValueTest });

    global.requestAnimationFrame(() => {
      expect(el[COMPONENT].test).toBe('value');
      document.body.removeChild(el);
      done();
    });
  });
});

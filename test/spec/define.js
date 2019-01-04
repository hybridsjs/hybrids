import { test } from '../helpers';
import define from '../../src/define';
import { invalidate } from '../../src/cache';

describe('define:', () => {
  it('returns custom element with a name', () => {
    const CustomElement = define('test-define-custom-element', {});
    expect({}.isPrototypeOf.call(HTMLElement.prototype, CustomElement.prototype)).toBe(true);
    expect(CustomElement.name).toBe('test-define-custom-element');
  });

  describe('for map argument', () => {
    it('defines hybrids', (done) => {
      const testHtmlDefine = { value: 'test' };
      const TestPascal = { value: 'value-test-pascal' };
      const HTMLDefine = { value: 'value-html-define' };
      define({ testHtmlDefine, TestPascal, HTMLDefine });

      requestAnimationFrame(() => {
        const testHtmlDefineEl = document.createElement('test-html-define');
        const testPascalEl = document.createElement('test-pascal');
        const htmlDefineEl = document.createElement('html-define');

        expect(testHtmlDefineEl.value).toBe('test');
        expect(testPascalEl.value).toBe('value-test-pascal');
        expect(htmlDefineEl.value).toBe('value-html-define');

        done();
      });
    });

    it('defines custom elements constructor', () => {
      class TestHtmlDefineExternalA extends HTMLElement {
        constructor() {
          super();
          this.value = 'test';
        }
      }

      define({ TestHtmlDefineExternalA });
      define({ TestHtmlDefineExternalA });

      const el = document.createElement('test-html-define-external-a');
      expect(el.value).toBe('test');
    });

    it('throws for invalid value', () => {
      expect(() => {
        define({ testHtmlDefineExternalD: 'value' });
      }).toThrow();
    });
  });

  describe('for object descriptor', () => {
    let spy;

    define('test-define-object', {
      one: {
        get: (host, v) => v + 1,
        set: (host, newVal) => newVal,
        connect: (...args) => spy(...args),
      },
      two: {
        set: (host, value) => value * value,
      },
      three: {
        one: 'one',
        two: 'two',
      },
      four: {
        connect: (host, key) => {
          host[key] = 'four';
        },
      },
    });

    const tree = test('<test-define-object></test-define-object>');

    beforeEach(() => {
      spy = jasmine.createSpy();
    });

    it('sets getter and setter', () => tree((el) => {
      el.one = 10;
      expect(el.one).toBe(11);
    }));

    it('sets setter and uses default getter', () => tree((el) => {
      el.two = 10;
      expect(el.two).toBe(100);
    }));

    it('sets property for empty descriptor', () => tree((el) => {
      expect(el.three).toEqual({ one: 'one', two: 'two' });
    }));

    it('uses default get and set methods when both omitted', () => tree((el) => {
      expect(el.four).toEqual('four');
    }));

    it('calls connect method', () => tree((el) => {
      expect(spy.calls.first().args[0]).toBe(el);
      expect(spy.calls.first().args[1]).toBe('one');
    }));

    it('returns previous value when invalidate', () => tree((el) => {
      el.one = 10;
      expect(el.one).toBe(11);
      invalidate(el, 'one');
      expect(el.one).toBe(12);
    }));
  });

  describe('for primitive value', () => {
    define('test-define-primitive', {
      testProperty: 'value',
    });

    const tree = test(`
      <test-define-primitive></test-define-primitive>
    `);

    it('applies property module with passed argument', () => tree((el) => {
      expect(el.testProperty).toBe('value');
    }));
  });

  describe('for function descriptor', () => {
    define('test-define-function', {
      getter: () => 'some value',
    });

    const tree = test(`
      <test-define-function></test-define-function>
    `);

    it('sets it as getter of the element property', () => tree((el) => {
      expect(el.getter).toBe('some value');
    }));
  });

  describe('for render key', () => {
    it('uses render factory if value is a function', () => {
      define('test-define-render', {
        render: () => {},
      });

      const tree = test('<test-define-render></test-define-render>');

      tree((el) => {
        expect(typeof el.render).toBe('function');
      });
    });

    it('does not use render factory if value is not a function', () => {
      define('test-define-render-other', {
        render: [],
      });

      const tree = test('<test-define-render-other></test-define-render-other>');

      tree((el) => {
        expect(typeof el.render).toBe('object');
      });
    });
  });

  describe('for empty object descriptor', () => {
    const one = {};
    const two = [];

    define('test-define-empty-object', {
      one,
      two,
    });

    const tree = test(`
      <test-define-empty-object></test-define-empty-object>
    `);

    it('sets object as a property', () => tree((el) => {
      expect(el.one).toBe(one);
      expect(el.two).toBe(two);
    }));
  });

  describe('already defined element', () => {
    const hybrids = {
      one: true,
    };

    const CustomElement = define('test-define-multiple', hybrids);
    define('test-define-multiple-two', {});

    beforeEach(() => {
      window.env = 'development';
    });

    it('returns the same custom element', () => {
      window.env = 'development';
      expect(define('test-define-multiple', hybrids)).toBe(CustomElement);

      window.env = 'production';
      expect(define('test-define-multiple', hybrids)).toBe(CustomElement);
    });

    describe('in dev environment', () => {
      it('updates when hybrids does not match', (done) => {
        test(`
          <test-define-multiple>
            <test-define-multiple-two></test-define-multiple-two>
          </test-define-multiple>
        `)((el) => {
          const spy = jasmine.createSpy('connect');
          const newHybrids = {
            one: 'text',
            two: {
              get: () => null,
              connect: spy,
            },
          };
          define('test-define-multiple', newHybrids);
          define('test-define-multiple-two', newHybrids);

          return Promise.resolve().then(() => {
            expect(el.one).toBe('text');
            expect(el.children[0].one).toBe('text');

            expect(spy).toHaveBeenCalledTimes(2);
            done();
          });
        });
      });

      it('updates elements in shadowRoot', (done) => {
        test('<div></div>')((el) => {
          const connect = jasmine.createSpy();

          el.attachShadow({ mode: 'open' });
          el.shadowRoot.innerHTML = '<test-define-multiple></test-define-multiple>';

          define('test-define-multiple', { one: { get: () => 'text', connect } });

          return Promise.resolve().then(() => {
            expect(connect).toHaveBeenCalledTimes(1);
            done();
          });
        });
      });
    });

    it('in prod environment throws when hybrids does not match', () => {
      window.env = 'production';
      expect(() => define('test-define-multiple', {})).toThrow();

      window.env = 'development';
    });
  });
});

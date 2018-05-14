import define from '../../src/define';

describe('define:', () => {
  it('should return custom element with a name', () => {
    const CustomElement = define('test-define-custom-element', {});
    expect({}.isPrototypeOf.call(HTMLElement.prototype, CustomElement.prototype)).toBe(true);
    expect(CustomElement.name).toBe('test-define-custom-element');
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
    });

    const tree = test('<test-define-object></test-define-object>');

    beforeEach(() => {
      spy = jasmine.createSpy();
    });

    it('should set getter and setter', () => tree((el) => {
      el.one = 10;
      expect(el.one).toBe(11);
    }));

    it('should set setter and default getter', () => tree((el) => {
      el.two = 10;
      expect(el.two).toBe(100);
    }));

    it('should set property for empty descriptor', () => tree((el) => {
      expect(el.three).toEqual({ one: 'one', two: 'two' });
    }));

    it('should call connect method', () => tree((el) => {
      expect(spy.calls.first().args[0]).toBe(el);
      expect(spy.calls.first().args[1]).toBe('one');
    }));
  });

  describe('for primitive value', () => {
    define('test-define-primitive', {
      testProperty: 'value',
    });

    const tree = test(`
      <test-define-primitive></test-define-primitive>
    `);

    it('should apply property module with passed argument', () => tree((el) => {
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

    it('should set it as getter of the element property', () => tree((el) => {
      expect(el.getter).toBe('some value');
    }));
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

    it('should set object as a property', () => tree((el) => {
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

    it('should return the same custom element', () => {
      window.env = 'development';
      expect(define('test-define-multiple', hybrids)).toBe(CustomElement);

      window.env = 'production';
      expect(define('test-define-multiple', hybrids)).toBe(CustomElement);
    });

    describe('in dev environment', () => {
      it('should update when hybrids does not match', (done) => {
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

      it('should update elements in shadowRoot', (done) => {
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

    it('in prod environment should throw when hybrids does not match', () => {
      window.env = 'production';
      expect(() => define('test-define-multiple', {})).toThrow();

      window.env = 'development';
    });
  });
});

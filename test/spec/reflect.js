import { test, resolveRaf } from '../helpers';
import define from '../../src/define';
import reflect from '../../src/reflect';

describe('reflect:', () => {
  const objProp = { a: 'apple' };

  let connectSpy;
  let observeSpy;

  beforeEach(() => {
    connectSpy = jasmine.createSpy();
    observeSpy = jasmine.createSpy();
  });

  define('test-reflect', {
    stringProp: reflect('value'),
    numberProp: reflect(123),
    falseBoolProp: reflect(false),
    trueBoolProp: reflect(true),
    funcProp: reflect(value => ({
      value,
    })),
    arrayProp: reflect([1, 'apple']),
    objProp: reflect(objProp),
    nullProp: reflect(null),
    undefinedProp: reflect(undefined),
    withLifecycleMethods: reflect(4, {
      connect: (host, key) => {
        connectSpy(host, key);
      },
      observe: (host, val, lastValue) => {
        observeSpy(host, val, lastValue);
      },
    }),
  });

  const empty = test('<test-reflect></test-reflect>');

  describe('observed properties are reflected to DOM attributes', () => {
    it('should have a string attribute', empty(el => resolveRaf(() => {
      expect(el.getAttribute('string-prop')).toBe('value');
    })));
    it('should remove a string attribute when empty', empty((el) => {
      el.stringProp = '';
      resolveRaf(() => {
        expect(el.getAttribute('string-prop')).toBe(null);
      });
    }));
    it('should remove a string attribute when undefined', empty((el) => {
      el.stringProp = undefined;
      resolveRaf(() => {
        expect(el.getAttribute('string-prop')).toBe(null);
      });
    }));
    it('should remove a string attribute when null', empty((el) => {
      el.stringProp = null;
      resolveRaf(() => {
        expect(el.getAttribute('string-prop')).toBe(null);
      });
    }));
    it('should have a number attribute', empty(el => resolveRaf(() => {
      expect(el.getAttribute('number-prop')).toBe('123');
    })));
    it('should remove a number attribute when undefined', empty((el) => {
      el.numberProp = undefined;
      resolveRaf(() => {
        expect(el.getAttribute('number-prop')).toBe(null);
      });
    }));
    it('should remove a number attribute when null', empty((el) => {
      el.numberProp = null;
      resolveRaf(() => {
        expect(el.getAttribute('number-prop')).toBe(null);
      });
    }));
    it('should have a true boolean attribute', empty(el => resolveRaf(() => {
      expect(el.getAttribute('true-bool-prop')).toBe('');
    })));
    it('should not have a false boolean attribute', empty(el => resolveRaf(() => {
      expect(el.getAttribute('false-bool-prop')).toBe(null);
    })));
    it('should not have a function attribute', empty(el => resolveRaf(() => {
      expect(el.getAttribute('func-prop')).toBe(null);
    })));
    it('should have a stringified array attribute', empty(el => resolveRaf(() => {
      expect(el.getAttribute('array-prop')).toBe('[1,"apple"]');
    })));
    it('should remove an array attribute when undefined', empty((el) => {
      el.arrayProp = undefined;
      resolveRaf(() => {
        expect(el.getAttribute('array-prop')).toBe(null);
      });
    }));
    it('should remove an array attribute when null', empty((el) => {
      el.arrayProp = null;
      resolveRaf(() => {
        expect(el.getAttribute('array-prop')).toBe(null);
      });
    }));
    it('should have a stringified object attribute', empty(el => resolveRaf(() => {
      expect(el.getAttribute('obj-prop')).toBe('{"a":"apple"}');
    })));
    it('should remove an object attribute when undefined', empty((el) => {
      el.objProp = undefined;
      resolveRaf(() => {
        expect(el.getAttribute('obj-prop')).toBe(null);
      });
    }));
    it('should remove an object attribute when null', empty((el) => {
      el.objProp = null;
      resolveRaf(() => {
        expect(el.getAttribute('obj-prop')).toBe(null);
      });
    }));
    it('should not have a null attribute', empty(el => resolveRaf(() => {
      expect(el.getAttribute('null-prop')).toBe(null);
    })));
    it('should not have an undefined attribute', empty(el => resolveRaf(() => {
      expect(el.getAttribute('undefined-prop')).toBe(null);
    })));
  });

  describe('reflected property with lifecycle methods', () => {
    it('should call user defined lifecycle methods method', empty((el) => {
      expect(connectSpy).toHaveBeenCalledTimes(1);

      resolveRaf(() => {
        el.numberWithMethods = 5;
        resolveRaf(() => {
          expect(observeSpy).toHaveBeenCalledTimes(1);
        });
      });
    }));
  });
});

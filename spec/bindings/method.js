import method from '../../src/bindings/method';
import define from '../../src/define';

describe('Method binding', () => {
  test(class MethodTest {
    static component = {
      bindings: {
        test: method(),
      },
    };

    constructor() {
      this.value = 'test';
    }

    test() {
      return this.value;
    }
  }, {
    'invokes component method': (el, component) => {
      const spy = spyOn(component, 'test');
      el.test();

      expect(spy).toHaveBeenCalled();
    },
  });

  it('throws for not existing method', () => {
    expect(() => define({ MethodThrowTest: class {
      static component = {
        bindings: {
          test: method(),
        },
      };
    } })).toThrow();
  });
});

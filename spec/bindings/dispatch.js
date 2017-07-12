import define from '../../src/define';
import dispatch from '../../src/bindings/dispatch';

describe('Binding dispatchEvent', () => {
  test(class {
    static component = {
      bindings: {
        test: dispatch('my-test'),
      },
    }

    // eslint-disable-next-line
    test(value) {
      return value;
    }
  }, {
    'dispatch event': (el, component) => {
      const spy = jasmine.createSpy('callback');
      const value = { test: 'test' };
      el.addEventListener('my-test', spy);

      component.test(value);
      component.test(false);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.mostRecent().args[0].detail).toBe(value);
    },
  });

  it('throws for not existing method', () => {
    expect(() => define({ MethodThrowTest: class {
      static component = {
        bindings: {
          test: dispatch('event'),
        },
      };
    } })).toThrow();
  });
});

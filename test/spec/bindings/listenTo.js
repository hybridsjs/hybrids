import define from '../../../src/define';
import listenTo from '../../../src/bindings/listenTo';

describe('Binding listenTo', () => {
  test(class {
    static component = {
      bindings: {
        test: listenTo('click'),
      },
    }

    // eslint-disable-next-line
    test() {}
  }, {
    'listen to host event': (el, component) => {
      const spy = spyOn(component, 'test');
      el.click();

      expect(spy).toHaveBeenCalled();
    },
  });

  it('throws for not existing method', () => {
    expect(() => define({ MethodThrowTest: class {
      static component = {
        bindings: {
          test: listenTo('click'),
        },
      };
    } })).toThrow();
  });
});

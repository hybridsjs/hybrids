import method from '../../../src/plugins/method';
import define from '../../../src/define';

describe('Plugin Method:', () => {
  const test = hybrid(class MethodTest {
    static plugins = {
      test: method(),
    };

    constructor() {
      this.test = this.test.bind(this);
      this.value = 'test';
    }

    test(...args) {
      return { value: this.value, args };
    }
  });

  it('invokes component method', test(({ el }) => {
    expect(el.test(1, 2)).toEqual({ value: 'test', args: [1, 2] });
  }));

  it('throws for not existing method', () => {
    expect(() => define({ MethodThrowTest: class {
      static plugins = {
        test: method(),
      };
    } })).toThrow();
  });
});

import method from '../../../src/plugins/method';

describe('Plugin Method:', () => {
  const test = hybrid(class MethodTest {
    static plugins = {
      test: method(),
    };

    constructor() {
      this.value = 'test';
    }

    test(...args) {
      return { value: this.value, args };
    }
  });

  it('invokes component method', test(({ el }) => {
    expect(el.test(1, 2)).toEqual({ value: 'test', args: [1, 2] });
  }));
});

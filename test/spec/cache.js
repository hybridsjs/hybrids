import { get, set, invalidate } from '../../src/cache';

describe('cache:', () => {
  const fn = (host, v) => v;
  let target;

  beforeEach(() => {
    target = {};
  });

  it('calls getter once', () => {
    const spy = jasmine.createSpy();
    const getter = () => {
      spy();
      return 'value';
    };

    expect(get(target, 'key', getter)).toBe('value');
    expect(get(target, 'key', getter)).toBe('value');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('set value', () => {
    set(target, 'key', fn, 'value', () => {});
    expect(get(target, 'key', fn)).toBe('value');
  });

  it('does not call get when set not changes value', () => {
    get(target, 'key', () => 'value');
    set(target, 'key', () => 'value', 'value', () => {});

    const spy = jasmine.createSpy('getter');
    get(target, 'key', spy);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('throws when set value while get another', () => {
    const getterWithSetter = () => {
      set(target, 'other-key', () => 'test-value');
      return 'value';
    };

    expect(() => {
      get(target, 'key', getterWithSetter);
    }).toThrow();
  });

  it('throws when get the same key in getter', () => {
    expect(() => {
      get(target, 'key', () => {
        get(target, 'key', () => 'value');
      });
    }).toThrow();
  });

  describe('invalidate', () => {
    it('updates state', () => {
      const spy = jasmine.createSpy('getter');
      get(target, 'key', spy);

      invalidate(target, 'key');
      get(target, 'key', spy);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('updates related value', () => {
      get(target, 'key', () => {
        get(target, 'related', () => 'one');
        return 'one';
      });

      invalidate(target, 'related');
      expect(get(target, 'key', () => 'two')).toBe('two');
    });

    it('throws when called inside getter', () => {
      expect(() => {
        get(target, 'key', () => invalidate(target, 'key'));
      }).toThrow();
    });
  });

  describe('with deps', () => {
    let deps;
    let spy;

    const getDepsKey = () => get(deps, 'key', (host, v) => v);
    const setDepsKey = value => set(deps, 'key', () => value, 'value', () => {});
    const getTargetKey = () => get(target, 'key', () => {
      spy();
      return getDepsKey();
    });

    beforeEach(() => {
      deps = {};
      spy = jasmine.createSpy();

      setDepsKey('value');
      getTargetKey();
    });

    it('uses cache value', () => {
      getTargetKey();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('recalculates value when deps changes', () => {
      setDepsKey('new value');
      getTargetKey();
      getTargetKey();
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
});

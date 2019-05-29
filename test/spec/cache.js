import {
  get, set, invalidate, observe,
} from '../../src/cache';

describe('cache:', () => {
  let target;
  let getSpy;

  beforeEach(() => {
    getSpy = jasmine.createSpy('getter');

    target = {
      value: 1,
      get one() {
        return get(target, 'one', (host, lastValue) => {
          getSpy(lastValue);
          return this.value;
        });
      },
      set one(value) {
        set(target, 'one', () => {
          this.value = value;
          return value;
        }, value);
      },
      get two() {
        return get(target, 'two', () => this.one);
      },
    };
  });

  it('calls getter once', () => {
    expect(target.one).toBe(1);
    expect(target.one).toBe(1);
    expect(getSpy).toHaveBeenCalledTimes(1);
  });

  it('set value', () => {
    target.one = 'value';
    expect(target.one).toBe('value');
  });

  it('does not call get when set not changes value', () => {
    expect(target.one).toBe(1);
    target.one = 1;

    expect(target.one).toBe(1);

    expect(getSpy).toHaveBeenCalledTimes(1);
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
    it('clears checksum', () => {
      expect(target.one).toBe(1);
      invalidate(target, 'one');

      expect(target.one).toBe(1);
      expect(target.one).toBe(1);

      expect(getSpy).toHaveBeenCalledTimes(2);
    });

    it('clears value', () => {
      expect(target.one).toBe(1);
      invalidate(target, 'one', true);

      expect(target.one).toBe(1);
      expect(target.one).toBe(1);

      expect(getSpy).toHaveBeenCalledTimes(2);
      expect(getSpy.calls.mostRecent().args[0]).toBe(undefined);
    });

    it('updates related value', () => {
      expect(target.two).toBe(1);

      invalidate(target, 'one');
      expect(target.two).toBe(1);
      expect(getSpy).toHaveBeenCalledTimes(2);
    });

    it('throws when called inside getter', () => {
      expect(() => {
        get(target, 'key', () => invalidate(target, 'key'));
      }).toThrow();
    });
  });

  describe('with deps', () => {
    let deps;
    let withDeps;
    let spy;

    beforeEach(() => {
      deps = {
        get source() { return get(deps, 'source', (host, v) => v); },
        set source(value) {
          set(deps, 'source', () => value, value, () => {});
        },
        get other() {
          return get(deps, 'other', () => deps.source);
        },
      };
      withDeps = {
        get key() {
          return get(withDeps, 'key', () => {
            spy();
            return deps.other;
          });
        },
      };

      spy = jasmine.createSpy();

      deps.source = 'value';
    });

    it('uses cache value', () => {
      expect(withDeps.key).toBe('value');
      expect(withDeps.key).toBe('value');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('uses cache when invalidate without change', () => {
      expect(withDeps.key).toBe('value');
      invalidate(deps, 'key');
      expect(withDeps.key).toBe('value');
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('recalculates value when deps changes', () => {
      expect(withDeps.key).toBe('value');
      deps.source = 'new value';
      expect(withDeps.key).toBe('new value');
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('observe', () => {
    let obj;
    let contextObj;
    let spy;

    const getContext = () => get(obj, 'obj', (t, v) => v);

    beforeEach(() => {
      obj = {};
      contextObj = {};
      spy = jasmine.createSpy('start spy');
      set(obj, 'obj', (t, v) => v, 'value');
    });

    it('- should call callback', (done) => {
      observe(contextObj, 'context', spy);
      expect(get(contextObj, 'context', getContext)).toBe('value');
      requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it('- should call callback when dependency value changes', (done) => {
      observe(contextObj, 'context', spy);
      expect(get(contextObj, 'context', getContext)).toBe('value');

      requestAnimationFrame(() => {
        set(obj, 'obj', (t, v) => v, 'new value');
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalledTimes(2);
          done();
        });
      });
    });

    it('- should call callback when deep dependency value changes', (done) => {
      observe(contextObj, 'context', spy);
      expect(get(contextObj, 'context', getContext)).toBe('value');

      const deepObj = {};
      set(deepObj, 'deep', (t, v) => v, 'value');

      invalidate(obj, 'obj');
      get(obj, 'obj', () => {
        const result = get(deepObj, 'deep', (t, v) => v);
        return result;
      });

      requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalledTimes(1);
        spy = jasmine.createSpy();
        observe(contextObj, 'context', spy);

        requestAnimationFrame(() => {
          set(deepObj, 'deep', (t, v) => v, 'new value');

          requestAnimationFrame(() => {
            expect(spy).toHaveBeenCalledTimes(2);
            done();
          });
        });
      });
    });

    it('- removes contexts from deps when context changes dependencies', (done) => {
      observe(contextObj, 'context', spy);

      expect(get(contextObj, 'context', getContext)).toBe('value');
      set(contextObj, 'context', (t, v) => v, 'another value');
      expect(get(contextObj, 'context', (t, v) => v)).toBe('another value');


      requestAnimationFrame(() => {
        set(obj, 'obj', (t, v) => v, 'better value');
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });

    it('- skips contexts from deps when context changes dependencies', (done) => {
      expect(get(contextObj, 'context', getContext)).toBe('value');
      set(contextObj, 'context', (t, v) => v, 'another value');
      expect(get(contextObj, 'context', (t, v) => v)).toBe('another value');

      observe(contextObj, 'context', spy);

      requestAnimationFrame(() => {
        set(obj, 'obj', (t, v) => v, 'better value');
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalledTimes(1);
          done();
        });
      });
    });
  });
});

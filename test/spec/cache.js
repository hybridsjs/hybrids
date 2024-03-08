import {
  get,
  set,
  assert,
  getEntries,
  invalidate,
  invalidateAll,
  observe,
} from "../../src/cache.js";

import { resolveRaf, resolveTimeout } from "../helpers.js";

describe("cache:", () => {
  let target;
  let spy;

  beforeEach(() => {
    target = {};
    spy = jasmine.createSpy();
  });

  describe("get()", () => {
    it("throws for circular call", () => {
      expect(() =>
        get(target, "key", () => get(target, "key", () => {})),
      ).toThrow();
    });

    it("throws for nested circular call", () => {
      expect(() =>
        get(target, "key", () =>
          get(target, "otherKey", () => get(target, "otherKey", () => {})),
        ),
      ).toThrow();
    });

    it("re-throws getter error with cleanup", () => {
      expect(() =>
        get(target, "key", () =>
          get(target, "otherKey", () => {
            throw Error();
          }),
        ),
      ).toThrow();
      expect(get(target, "key", () => "value")).toBe("value");
    });

    it("returns value from getter", () => {
      expect(get(target, "key", () => "value")).toBe("value");
    });

    it("runs getter only once if it has no dependencies", () => {
      get(target, "key", () => "value");
      get(target, "key", spy);

      expect(spy).not.toHaveBeenCalled();
    });

    it("runs getter only once if dependencies do not change", () => {
      Object.defineProperty(target, "otherKey", {
        get: () => get(target, "otherKey", () => "value"),
      });

      get(target, "key", () => target.otherKey);
      get(target, "key", spy);

      expect(spy).not.toHaveBeenCalled();
    });

    it("runs getter again if invalidates dependency", () => {
      Object.defineProperty(target, "otherKey", {
        get: () => get(target, "otherKey", () => "value"),
      });

      get(target, "key", () => target.otherKey);
      invalidate(target, "otherKey");

      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("set()", () => {
    it("works with circular call", () => {
      get(target, "one", () => {
        get(target, "two", () => "value");
        get(target, "three", () => true);
        set(target, "three", () => false);

        return "value";
      });

      set(target, "two", () => "other value");
      get(target, "one", spy);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("invalidates state for next get call", () => {
      get(target, "key", () => "value");
      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(0);

      set(target, "key", () => "new value");
      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(target, undefined, "new value");
    });

    it("does not invalidates state for next get call", () => {
      get(target, "key", () => "value");
      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(0);

      set(target, "key", () => "value");
      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it("invalidates dependant properties", () => {
      get(target, "key", () => get(target, "otherKey", () => "value"));
      set(target, "otherKey", () => "new value");

      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(target, undefined, "value");
    });
  });

  describe("getEntries()", () => {
    it("returns empty array for new object", () => {
      expect(getEntries({})).toEqual([]);
    });

    it("returns an array with entries", () => {
      const host = {};
      get(host, "key", () => "value");
      expect(getEntries(host)).toEqual([
        jasmine.objectContaining({
          value: "value",
        }),
      ]);
    });
  });

  describe("invalidate()", () => {
    it("clears cached value", () => {
      get(target, "key", () => "value");
      invalidate(target, "key", { clearValue: true });

      get(target, "key", spy);
      expect(spy).toHaveBeenCalledWith(target, undefined, undefined);
    });

    it("clears dependencies", () => {
      get(target, "key", () => get(target, "otherKey", () => "value"));
      invalidate(target, "key");
      get(target, "key", () => "value");

      set(target, "otherKey", () => "new value");
      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it("deletes entry if it has no contexts", () => {
      get(target, "key", () =>
        get(target, "otherKey", () => get(target, "deepKey", () => "value")),
      );
      invalidate(target, "otherKey", { deleteEntry: true });

      return resolveTimeout(() => {
        expect(getEntries(target).map(({ key }) => key)).toEqual([
          "key",
          "deepKey",
        ]);
      });
    });

    it("does not delete entry if it has contexts", () => {
      get(target, "key", () =>
        get(target, "otherKey", () => get(target, "deepKey", () => "value")),
      );
      invalidate(target, "otherKey", { deleteEntry: true });

      get(target, "key", () =>
        get(target, "otherKey", () => get(target, "deepKey", () => "value")),
      );

      return resolveTimeout(() => {
        expect(getEntries(target).map(({ key }) => key)).toEqual([
          "key",
          "otherKey",
          "deepKey",
        ]);
      });
    });
  });

  describe("invalidateAll()", () => {
    it("does nothing if target has no entries", () => {
      expect(() => invalidateAll({})).not.toThrow();
    });

    it("clears all entries", () => {
      get(target, "key", () => "value");

      expect(getEntries(target).length).toBe(1);

      invalidateAll(target, { clearValue: true });
      expect(getEntries(target)).toEqual([
        jasmine.objectContaining({
          value: undefined,
        }),
      ]);
    });
  });

  describe("observe()", () => {
    const _ = (t, v) => v;

    it("does not throw for manual call before observe is setup", () => {
      expect(() => {
        const getter = () => get(target, "dep", () => "value");
        get(target, "key", getter);
        assert(target, "dep", "new value");
        observe(target, "key", getter, spy);
        get(target, "key", getter);
      }).not.toThrow();
    });

    it("does not throw for unobserve called synchronously after observe", () => {
      expect(() => {
        const getter = () => get(target, "dep", () => "value");
        get(target, "key", getter);
        assert(target, "dep", "new value");
        const unobserve = observe(target, "key", getter, spy);
        unobserve();
      }).not.toThrow();
    });

    it("calls observe callback after initial get before setup", () => {
      assert(target, "dep", "value");
      const getter = () => get(target, "dep", _);
      get(target, "key", getter);

      observe(target, "key", getter, spy);

      return resolveRaf(() => {
        assert(target, "dep", "new value");
        return resolveRaf(() => {
          expect(spy).toHaveBeenCalledTimes(2);
        });
      });
    });

    it("runs callback when value changes", () => {
      observe(target, "key", _, spy);
      assert(target, "key", "value");

      return resolveRaf(() => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(target, "value", undefined);
      });
    });

    it("does not run callback for the first time when value is undefined", () => {
      observe(target, "key", _, spy);

      return resolveRaf(() => {
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });

    it("does not run callback when unobserve", () => {
      let value = "value";
      const unobserve = observe(target, "key", () => value, spy);

      unobserve();

      value = "new value";
      assert(target, "key", value);

      return resolveRaf(() => {
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    it("runs callback when dependency changes", () => {
      const getter = () =>
        get(target, "otherKey", () => get(target, "deepKey", _));
      observe(target, "key", getter, spy);

      return resolveRaf(() => {
        expect(spy).toHaveBeenCalledTimes(0);
        assert(target, "deepKey", "value");

        return resolveRaf(() => {
          expect(spy).toHaveBeenCalledTimes(1);
          expect(spy).toHaveBeenCalledWith(target, "value", undefined);
        });
      });
    });

    it("runs callback when deep value changes", () => {
      const getDeepDeep = () => get(target, "deepDeep", _);
      const getDeepDep = () => get(target, "deep", getDeepDeep);
      const getDep = () => get(target, "dep", getDeepDep);
      const getOther = () => get(target, "other", _);

      assert(target, "deepDeep", "one");

      observe(
        target,
        "key",
        () => {
          getOther();
          getDep();
          return {};
        },
        spy,
      );

      return resolveRaf(() => {
        expect(spy).toHaveBeenCalledTimes(1);
        assert(target, "other", "two");
        return resolveRaf(() => {
          expect(spy).toHaveBeenCalledTimes(2);
          assert(target, "deepDeep", "three");
          return resolveRaf(() => {
            expect(spy).toHaveBeenCalledTimes(3);
          });
        });
      });
    });

    it("cleans emitter when unobserve", () => {
      const unobserve = observe(target, "key", _, spy);

      return resolveRaf(() => {
        unobserve();
        assert(target, "key", "value");
        return resolveRaf(() => {
          expect(spy).toHaveBeenCalledTimes(0);
        });
      });
    });

    it("cleans dependencies contexts when unobserve", () => {
      const getter = () =>
        get(target, "otherKey", () => get(target, "deepKey", _));
      const unobserve = observe(target, "key", getter, spy);

      return resolveRaf(() => {
        unobserve();
        assert(target, "deepKey", "value");

        return resolveRaf(() => {
          expect(spy).toHaveBeenCalledTimes(0);
        });
      });
    });

    it("cleans contexts when getter throws", () => {
      const getKey = () =>
        get(target, "otherKey", () => {
          throw Error();
        });

      expect(() => observe(target, "key", getKey, spy)).not.toThrow();
      assert(target, "otherKey", "value");

      return resolveRaf(() => {
        expect(spy).toHaveBeenCalledTimes(0);
      });
    });
  });
});

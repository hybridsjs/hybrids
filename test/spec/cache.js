import { get, set, invalidate, observe } from "../../src/cache.js";

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
      get(target, "key", () => get(target, "otherKey", () => "value"));
      get(target, "key", spy);

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("set()", () => {
    it("throws called inside of the get()", () => {
      expect(() =>
        get(target, "key", () => set(target, "key", () => {})),
      ).toThrow();
    });

    it("does not throws called inside of the get() when forced", () => {
      expect(() =>
        get(target, "key", () => set(target, "key", () => {}, "", true)),
      ).not.toThrow();
    });

    it("invalidates state for next get call", () => {
      get(target, "key", () => "value");
      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(0);

      set(target, "key", () => "new value");
      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(target, "new value");
    });

    it("invalidates dependant properties", () => {
      get(target, "key", () => get(target, "otherKey", () => "value"));
      set(target, "otherKey", () => "new value");

      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(target, "value");
    });
  });

  describe("invalidate()", () => {
    it("throws if called inside of the get()", () => {
      expect(() =>
        get(target, "key", () => invalidate(target, "key")),
      ).toThrow();
    });

    it("clears cached value", () => {
      get(target, "key", () => "value");
      invalidate(target, "key", true);

      get(target, "key", spy);
      expect(spy).toHaveBeenCalledWith(target, undefined);
    });

    it("clears dependencies", () => {
      get(target, "key", () => get(target, "otherKey", () => "value"));
      invalidate(target, "key");
      get(target, "key", () => "value");

      set(target, "otherKey", () => "new value");
      get(target, "key", spy);

      expect(spy).toHaveBeenCalledTimes(0);
    });
  });

  describe("observe()", () => {
    const _ = (t, v) => v;

    it("does not throw for manual call before observe is setup", () => {
      expect(() => {
        const getter = () => get(target, "dep", () => "value");
        get(target, "key", getter);
        set(target, "dep", () => "new value");
        observe(target, "key", getter, spy);
        get(target, "key", getter);
      }).not.toThrow();
    });

    it("does not throw for unobserve called synchronously after observe", () => {
      expect(() => {
        const getter = () => get(target, "dep", () => "value");
        get(target, "key", getter);
        set(target, "dep", () => "new value");
        const unobserve = observe(target, "key", getter, spy);
        unobserve();
      }).not.toThrow();
    });

    it("calls observe callback after initial get before setup", done => {
      set(target, "dep", () => "value");
      const getter = () => get(target, "dep", _);
      get(target, "key", getter);

      observe(target, "key", getter, spy);

      requestAnimationFrame(() => {
        set(target, "dep", () => "new value");
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalledTimes(2);
          done();
        });
      });
    });

    it("runs callback when value changes", done => {
      observe(target, "key", _, spy);
      set(target, "key", _, "value");

      requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(target, "value", undefined);
        done();
      });
    });

    it("does not run callback for the first time when value is undefined", done => {
      observe(target, "key", _, spy);

      requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalledTimes(0);
        done();
      });
    });

    it("runs callback when dependency changes", done => {
      const getter = () =>
        get(target, "otherKey", () => get(target, "deepKey", _));
      observe(target, "key", getter, spy);

      requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalledTimes(0);
        set(target, "deepKey", _, "value");

        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalledTimes(1);
          expect(spy).toHaveBeenCalledWith(target, "value", undefined);
          done();
        });
      });
    });

    it("cleans emitter when unobserve", done => {
      const unobserve = observe(target, "key", _, spy);

      requestAnimationFrame(() => {
        unobserve();
        set(target, "key", _, "value");
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalledTimes(0);
          done();
        });
      });
    });

    it("cleans dependencies contexts when unobserve", done => {
      const getter = () =>
        get(target, "otherKey", () => get(target, "deepKey", _));
      const unobserve = observe(target, "key", getter, spy);

      requestAnimationFrame(() => {
        unobserve();
        set(target, "deepKey", _, "value");

        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalledTimes(0);
          done();
        });
      });
    });

    it("cleans contexts when getter throws", done => {
      const getKey = () =>
        get(target, "key", () =>
          get(target, "otherKey", () => {
            throw Error();
          }),
        );
      const unobserve = observe(target, "key", () => {}, spy);

      expect(() => getKey()).toThrow();

      requestAnimationFrame(() => {
        expect(() => unobserve()).not.toThrow();
        done();
      });
    });
  });
});

import { dispatch, subscribe } from "../../src/emitter.js";

describe("emitter:", () => {
  let spy;
  let target;

  beforeEach(() => {
    spy = jasmine.createSpy();
    target = {};
  });

  it("subscribe saves fn and dispatch target in next animation frame", done => {
    subscribe(target, spy);
    requestAnimationFrame(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe("dispatch", () => {
    let origRAF;
    let catchSpy;

    beforeEach(() => {
      catchSpy = jasmine.createSpy();
    });

    beforeAll(() => {
      origRAF = window.requestAnimationFrame;
      window.requestAnimationFrame = function requestAnimationFrame(fn) {
        origRAF.call(this, () => {
          try {
            fn();
          } catch (e) {
            catchSpy(fn);
          }
        });
      };
    });

    afterAll(() => {
      window.requestAnimationFrame = origRAF;
    });

    it("calls fn for target", done => {
      subscribe(target, spy);
      requestAnimationFrame(() => {
        dispatch(target);
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalledTimes(2);
          done();
        });
      });
    });

    it("catches error", done => {
      subscribe(target, () => {
        throw new Error("asd");
      });

      requestAnimationFrame(() => {
        expect(catchSpy).toHaveBeenCalledTimes(1);
        done();
      });
    });

    it("catches error and calls next target", done => {
      const target2 = {};

      subscribe(target, () => {
        throw new Error("asd");
      });
      subscribe(target2, spy);

      requestAnimationFrame(() => {
        expect(catchSpy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});

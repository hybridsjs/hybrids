import { injectable, resolve, callWithContext, proxy } from '../src/proxy';

describe('Core | Proxy', () => {
  describe('injectable & resolve', () => {
    let spy;
    let wrapper;
    let context;

    beforeEach(() => {
      context = {};
      spy = jasmine.createSpy();
      wrapper = injectable(spy);
    });

    it('wrapper throws error', () => {
      expect(() => wrapper()).toThrow();
    });

    it('call function with context', () => {
      callWithContext(context, wrapper);
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.mostRecent().args[0]).toEqual(context);
    });

    it('resolve throws error', () => {
      expect(() => resolve(wrapper)).toThrow();
    });

    it('return function with injected context', () => {
      const fn = callWithContext(context, () => resolve(wrapper));
      fn();
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.mostRecent().args[0]).toEqual(context);
    });
  });

  describe('proxy', () => {
    let context;
    let Controller;
    let ctrl;
    let wrapper;
    let spy;

    beforeAll(() => {
      context = {};
      spy = jasmine.createSpy();
      wrapper = injectable(spy);
      Controller = class {
        test1() {
          wrapper();
        }

        get test2() {
          return wrapper();
        }

        set test2(newVal) {
          wrapper(newVal);
        }
      };
    });

    describe('native Proxy', () => {
      beforeEach(() => {
        ctrl = proxy(context, () => new Controller());
      });

      it('call with context prototype method', () => {
        ctrl.test1();
        expect(spy.calls.mostRecent().args[0]).toEqual(context);
      });

      it('call with context prototype getter', () => {
        expect(ctrl.test2).toEqual(undefined);
        expect(spy.calls.mostRecent().args[0]).toEqual(context);
      });

      it('call with context prototype setter', () => {
        ctrl.test2 = 'new value';
        expect(spy.calls.mostRecent().args[0]).toEqual(context);
      });
    });

    describe('emulated Proxy', () => {
      let orgProxy;
      beforeAll(() => {
        orgProxy = Object.getOwnPropertyDescriptor(window, 'Proxy');
        delete window.Proxy;
      });

      afterAll(() => {
        if (orgProxy) Object.defineProperty(window, 'Proxy', orgProxy);
      });

      beforeEach(() => {
        ctrl = proxy(context, () => new Controller());
      });

      it('call with context prototype method', () => {
        ctrl.test1();
        expect(spy.calls.mostRecent().args[0]).toEqual(context);
      });

      it('call with context prototype getter', () => {
        expect(ctrl.test2).toEqual(undefined);
        expect(spy.calls.mostRecent().args[0]).toEqual(context);
      });

      it('call with context prototype setter', () => {
        ctrl.test2 = 'new value';
        expect(spy.calls.mostRecent().args[0]).toEqual(context);
      });
    });
  });
});

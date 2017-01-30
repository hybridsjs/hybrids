import { injectable, resolve, callWithContext, proxy, mapInstance } from '../src/proxy';

describe('core | proxy', () => {
  describe('injectable & resolve -', () => {
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

    it('calls function with context', () => {
      callWithContext(context, wrapper);
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.mostRecent().args[0]).toEqual(context);
    });

    it('resolves throws error', () => {
      expect(() => resolve(wrapper)).toThrow();
    });

    it('returns function with injected context', () => {
      const fn = callWithContext(context, () => resolve(wrapper));
      fn();
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.mostRecent().args[0]).toEqual(context);
    });
  });

  describe('proxy -', () => {
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

        get test3() { return 'test'; }
      };

      proxy(Controller);
      proxy(Controller); // second time should omit update
    });

    beforeEach(() => {
      ctrl = new Controller();
      mapInstance(ctrl, context);
    });

    it('returns value from method', () => {
      expect(ctrl.test3).toEqual('test');
    });

    it('calls with context prototype method', () => {
      ctrl.test1();
      expect(spy.calls.mostRecent().args[0]).toEqual(context);
    });

    it('calls with context prototype getter', () => {
      expect(ctrl.test2).toEqual(undefined);
      expect(spy.calls.mostRecent().args[0]).toEqual(context);
    });

    it('calls with context prototype setter', () => {
      ctrl.test2 = 'new value';
      expect(spy.calls.mostRecent().args[0]).toEqual(context);
    });
  });
});

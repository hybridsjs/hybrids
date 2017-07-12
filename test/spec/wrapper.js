describe('Wrapper', () => {
  let connect;
  let disconnect;

  class WrapperTest {
    constructor() {
      this.value = 'test value';
    }

    // eslint-disable-next-line
    connected(...args) {
      connect = jasmine.createSpy();
      connect(...args);
    }

    // eslint-disable-next-line
    disconnected(...args) {
      disconnect = jasmine.createSpy();
      disconnect(...args);
    }

    // eslint-disable-next-line
    changed() {}
  }

  test(
    WrapperTest,
    {
      'calls component constructor': (el, component) => {
        expect(component instanceof WrapperTest).toBe(true);
      },

      'calls component connected callback': (el) => {
        expect(connect).toHaveBeenCalledTimes(1);
        expect(connect.calls.mostRecent().args[0]).toBe(el);
      },

      'calls component disconnected callback': (el) => {
        document.body.removeChild(el);
        return (done) => {
          expect(disconnect).toHaveBeenCalledTimes(1);
          expect(disconnect.calls.mostRecent().args[0]).toBe(el);
          done();
        };
      },
      'calls component changed callback': (el, component) => {
        const spy = spyOn(component, 'changed');
        component.value = 'new value';

        return (done) => {
          expect(spy).toHaveBeenCalledTimes(1);
          done();
        };
      },
    },
  );
});

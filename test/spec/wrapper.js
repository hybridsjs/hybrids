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

  const test = hybrid(WrapperTest);

  it('calls component constructor', test(({ component }) => {
    expect(component instanceof WrapperTest).toBe(true);
  }));


  it('calls component connected callback', test(({ el }) => {
    expect(connect).toHaveBeenCalledTimes(1);
    expect(connect.calls.mostRecent().args[0]).toBe(el);
  }));


  it('calls component disconnected callback', test(({ el }) => {
    document.body.removeChild(el);
    return (done) => {
      expect(disconnect).toHaveBeenCalledTimes(1);
      expect(disconnect.calls.mostRecent().args[0]).toBe(el);
      done();
    };
  }));

  it('calls component changed callback', test(({ component }) => {
    const spy = spyOn(component, 'changed');
    component.value = 'new value';

    return (done) => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.mostRecent().args[0]).toEqual({ value: 'test value' });
      done();
    };
  }));
});

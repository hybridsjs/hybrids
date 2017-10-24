describe('Wrapper', () => {
  let connect;
  let disconnect;

  class WrapperTest {
    constructor(host) {
      this.host = host;
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

  it('calls component constructor', test(({ component, el }) => {
    expect(component instanceof WrapperTest).toBe(true);
    expect(component.host).toBe(el);
  }));


  it('calls component connected callback', test(() => {
    expect(connect).toHaveBeenCalledTimes(1);
  }));


  it('calls component disconnected callback', test(({ el }) => {
    document.body.removeChild(el);
    return (done) => {
      expect(disconnect).toHaveBeenCalledTimes(1);
      done();
    };
  }));

  it('calls component changed callback', test(({ component }) => {
    const spy = spyOn(component, 'changed');
    component.value = 'new value';

    return (done) => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.mostRecent().args[0]).toEqual(
        jasmine.objectContaining({ value: 'test value' }),
      );
      done();
    };
  }));
});

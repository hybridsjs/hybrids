import { dispatchEvent } from '../../src/plugins/dispatch-event';

describe('Core | Plugins | Dispatch Event -', () => {
  let context;
  let spy;

  beforeEach(() => {
    context = document.createElement('div');
    spy = jasmine.createSpy('callback');
    context.addEventListener('custom-event', spy);
  });

  it('dispatch event', () => {
    dispatchEvent.call(context, 'custom-event');
    expect(spy).toHaveBeenCalled();
  });

  it('push detail property', () => {
    dispatchEvent.call(context, 'custom-event', { detail: 'some text' });
    expect(spy.calls.mostRecent().args[0].detail).toEqual('some text');
  });
});

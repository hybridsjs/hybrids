import { dispatchEvent } from '../src/dispatch-event';

describe('core | dispatch event -', () => {
  let context;
  let spy;

  beforeEach(() => {
    context = document.createElement('div');
    spy = jasmine.createSpy('callback');
    context.addEventListener('custom-event', spy);
  });

  it('dispatches event', () => {
    dispatchEvent(context, 'custom-event');
    expect(spy).toHaveBeenCalled();
  });

  it('pushes detail property', () => {
    dispatchEvent(context, 'custom-event', { detail: 'some text' });
    expect(spy.calls.mostRecent().args[0].detail).toEqual('some text');
  });
});

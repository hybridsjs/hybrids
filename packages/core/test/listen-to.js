import { listenTo } from '../src/listen-to';
import { CONTROLLER } from '../src/symbols';

describe('core | listenTo -', () => {
  let context;
  let ctrl;
  let spy;
  let revoke;

  beforeEach(() => {
    context = document.createElement('div');
    ctrl = {};
    context[CONTROLLER] = ctrl;

    spy = jasmine.createSpy('callback');

    revoke = listenTo(context, 'click', spy);
    context.click();
  });

  it('adds event listener', () => {
    expect(spy).toHaveBeenCalled();
  });

  it('calls with controller context', () => {
    expect(spy.calls.mostRecent().object).toEqual(ctrl);
  });

  it('returns revoke function', () => {
    context.click();
    revoke();
    context.click();

    expect(spy.calls.count()).toEqual(2);
  });
});

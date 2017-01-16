import { listenTo } from '../../src/plugins/listen-to';
import { CONTROLLER } from '../../src/symbols';

describe('Core | Plugins | ListenTo -', () => {
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

  it('add event listener', () => {
    expect(spy).toHaveBeenCalled();
  });

  it('calls with controller context', () => {
    expect(spy.calls.mostRecent().object).toEqual(ctrl);
  });

  it('return revoke function', () => {
    context.click();
    revoke();
    context.click();

    expect(spy.calls.count()).toEqual(2);
  });
});

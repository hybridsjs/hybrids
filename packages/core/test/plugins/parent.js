import { define, CONTROLLER } from '../../src/index';
import { parent } from '../../src/plugins/parent';

describe('Core | Plugins | Parent -', () => {
  let parentEl;
  let childEl;

  class CorePluginsParent {}

  beforeAll(() => {
    define({ CorePluginsParent });
  });

  beforeEach(() => {
    parentEl = document.createElement('core-plugins-parent');
    childEl = document.createElement('div');
  });

  it('return parent controller', () => {
    parentEl.appendChild(childEl);
    expect(parent.call(childEl, CorePluginsParent)).toEqual(parentEl[CONTROLLER]);
  });

  it('return parent controller in shadowRoot', () => {
    const div = document.createElement('div');
    const shadow = div.attachShadow({ mode: 'open' });
    shadow.appendChild(parentEl);
    parentEl.appendChild(document.createElement('div'));
    parentEl.children[0].appendChild(childEl);
    expect(parent.call(childEl, CorePluginsParent)).toEqual(parentEl[CONTROLLER]);
  });

  it('return null', () => {
    expect(parent.call(childEl, class {})).toEqual(null);
  });

  it('throw error', () => {
    expect(() => parent.call(childEl)).toThrow();
  });
});

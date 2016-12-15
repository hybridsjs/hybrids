import { define, CONTROLLER } from '../../src/index';
import { parent } from '../../src/plugins/parent';

describe('Core | Plugins | Parent -', () => {
  let parentEl;
  let childEl;

  class CorePluginsParent {}
  class CorePluginsParentChild {}

  beforeAll(() => {
    define({ CorePluginsParent, CorePluginsParentChild });
  });

  beforeEach(() => {
    parentEl = document.createElement('core-plugins-parent');
    childEl = document.createElement('core-plugins-parent-child');
    document.body.appendChild(parentEl);
  });

  afterEach(() => {
    if (parentEl.parentElement) parentEl.parentElement.removeChild(parentEl);
  });

  rafIt('return parent controller', () => {
    parentEl.appendChild(childEl);
    requestAnimationFrame(() => {
      expect(parent.call(childEl, CorePluginsParent)).toEqual(parentEl[CONTROLLER]);
    });
  });

  it('return parent controller in shadowRoot', (done) => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    requestAnimationFrame(() => {
      const shadow = div.attachShadow({ mode: 'open' });
      shadow.appendChild(parentEl);
      parentEl.appendChild(document.createElement('div'));
      parentEl.children[0].appendChild(childEl);
      requestAnimationFrame(() => {
        expect(parent.call(childEl, CorePluginsParent)).toEqual(parentEl[CONTROLLER]);
        document.body.removeChild(div);
        done();
      });
    });
  });

  rafIt('return null', () => {
    document.body.appendChild(childEl);
    requestAnimationFrame(() => {
      expect(parent.call(childEl, class {})).toEqual(null);
      document.body.removeChild(childEl);
    });
  });

  it('throw when not connected', () => {
    expect(() => parent.call(childEl)).toThrow();
  });

  rafIt('throw error for invalid arguments', () => {
    expect(() => parent.call(childEl, 123)).toThrow();
  });
});

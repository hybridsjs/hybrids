import { define, CONTROLLER } from '../src/index';
import { parent } from '../src/parent';

describe('core | parent -', () => {
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
    if (parentEl.parentElement === document.body) document.body.removeChild(parentEl);
  });

  it('throws when controller is not initialized', () => {
    expect(() => parent(document.createElement('div'), CorePluginsParent)).toThrow();
  });

  rafIt('returns parent controller', () => {
    parentEl.appendChild(childEl);
    requestAnimationFrame(() => {
      expect(parent(childEl, CorePluginsParent)).toEqual(parentEl[CONTROLLER]);
    });
  });

  it('returns parent controller in shadowRoot', (done) => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    requestAnimationFrame(() => {
      const shadow = div.attachShadow({ mode: 'open' });
      shadow.appendChild(parentEl);
      parentEl.appendChild(document.createElement('div'));
      parentEl.children[0].appendChild(childEl);
      requestAnimationFrame(() => {
        expect(parent(childEl, CorePluginsParent)).toEqual(parentEl[CONTROLLER]);
        document.body.removeChild(div);
        done();
      });
    });
  });

  rafIt('returns null', () => {
    document.body.appendChild(childEl);
    requestAnimationFrame(() => {
      expect(parent(childEl, class {})).toEqual(null);
      document.body.removeChild(childEl);
    });
  });

  it('throws when not connected', () => {
    expect(() => parent(childEl)).toThrow();
  });

  rafIt('throws error for invalid arguments', () => {
    expect(() => parent(childEl, 123)).toThrow();
  });
});

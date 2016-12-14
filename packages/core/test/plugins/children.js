import { define, CONTROLLER } from '../../src/index';
import { children } from '../../src/plugins/children';

function getControllers(prefix, node) {
  return Array.from(node.querySelectorAll(`${prefix} core-plugins-children`.trim())).map(child => child[CONTROLLER]);
}

describe('Core | Plugins | Children -', () => {
  let parentEl;

  class CorePluginsChildrenParent {}
  class CorePluginsChildren {}

  beforeAll(() => {
    define({ CorePluginsChildren, CorePluginsChildrenParent });
  });

  beforeEach(() => {
    parentEl = document.createElement('core-plugins-children-parent');
    for (let i = 0; i < 5; i += 1) {
      parentEl.appendChild(document.createElement('core-plugins-children'));
    }

    const div = document.createElement('div');
    div.appendChild(document.createElement('core-plugins-children'));

    const span = document.createElement('span');
    span.appendChild(document.createElement('core-plugins-children'));

    parentEl.appendChild(div);
    parentEl.children[0].appendChild(span);
  });

  it('throw for invalid arguments', () => {
    expect(() => children()).toThrow();
    expect(() => children(CorePluginsChildrenParent, 123)).toThrow();
  });

  it('return direct children list', () => {
    const list = children.call(parentEl, CorePluginsChildren);
    expect(list).toEqual(getControllers('*:not(div):not(span) >', parentEl));
  });

  it('return deep children list', () => {
    const list = children.call(parentEl, CorePluginsChildren, { deep: true });
    expect(list).toEqual(getControllers('*:not(span) >', parentEl));
  });

  it('return nested deep children list', () => {
    const list = children.call(parentEl, CorePluginsChildren, { deep: true, nested: true });
    expect(list).toEqual(getControllers('', parentEl));
  });

  it('return children list when only nested selected', () => {
    const list = children.call(parentEl, CorePluginsChildren, { nested: true });
    expect(list).toEqual(getControllers('*:not(div):not(span) >', parentEl));
  });

  describe('observer', () => {
    afterEach(() => {
      if (parentEl.parentElement) document.body.removeChild(parentEl);
    });

    it('update children list for DOM changes before', (done) => {
      const list = children.call(parentEl, CorePluginsChildren);
      document.body.appendChild(parentEl);
      requestAnimationFrame(() => {
        parentEl.removeChild(parentEl.children[0]);
        parentEl.insertBefore(parentEl.children[1], null);

        requestAnimationFrame(() => {
          expect(list).toEqual(getControllers('*:not(div):not(span) >', parentEl));
          done();
        });
      });
    });

    it('update children list for DOM changes after', (done) => {
      document.body.appendChild(parentEl);
      requestAnimationFrame(() => {
        const list = children.call(parentEl, CorePluginsChildren);
        parentEl.removeChild(parentEl.children[0]);
        parentEl.insertBefore(parentEl.children[1], null);

        requestAnimationFrame(() => {
          expect(list).toEqual(getControllers('*:not(div):not(span) >', parentEl));
          done();
        });
      });
    });

    it('not update children list for DOM changes', (done) => {
      const list = children.call(parentEl, CorePluginsChildren);
      const controllers = getControllers('*:not(div):not(span) >', parentEl);

      parentEl.removeChild(parentEl.children[0]);
      parentEl.insertBefore(parentEl.children[1], null);

      requestAnimationFrame(() => {
        expect(list).toEqual(controllers);
        done();
      });
    });
  });
});

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
    parentEl.appendChild(div);
  });

  it('throw for invalid arguments', () => {
    expect(() => children()).toThrow();
  });

  it('return direct children list', () => {
    const list = children.call(parentEl, CorePluginsChildren);
    expect(list).toEqual(getControllers('*:not(div) >', parentEl));
  });

  it('return deep children list', () => {
    const list = children.call(parentEl, CorePluginsChildren, { deep: true });
    expect(list).toEqual(getControllers('', parentEl));
  });

  describe('observer', () => {
    afterEach(() => {
      if (parentEl.parentElement) document.body.removeChild(parentEl);
    });

    it('update children list for DOM changes', (done) => {
      const list = children.call(parentEl, CorePluginsChildren);
      document.body.appendChild(parentEl);
      requestAnimationFrame(() => {
        parentEl.removeChild(parentEl.children[0]);
        parentEl.insertBefore(parentEl.children[1], null);

        requestAnimationFrame(() => {
          expect(list).toEqual(getControllers('*:not(div) >', parentEl));
          done();
        });
      });
    });

    it('update children list for DOM changes', (done) => {
      document.body.appendChild(parentEl);
      requestAnimationFrame(() => {
        const list = children.call(parentEl, CorePluginsChildren);
        parentEl.removeChild(parentEl.children[0]);
        parentEl.insertBefore(parentEl.children[1], null);

        requestAnimationFrame(() => {
          expect(list).toEqual(getControllers('*:not(div) >', parentEl));
          done();
        });
      });
    });

    it('not update children list for DOM changes', (done) => {
      const list = children.call(parentEl, CorePluginsChildren);
      const controllers = getControllers('*:not(div) >', parentEl);

      parentEl.removeChild(parentEl.children[0]);
      parentEl.insertBefore(parentEl.children[1], null);

      requestAnimationFrame(() => {
        expect(list).toEqual(controllers);
        done();
      });
    });
  });
});

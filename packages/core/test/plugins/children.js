import { define, CONTROLLER } from '../../src/index';
import wrappedChildren, { children } from '../../src/plugins/children';

function getControllers(prefix, node) {
  return Array.from(node.querySelectorAll(`${prefix} core-plugins-children`.trim()))
    .map(child => child[CONTROLLER]);
}

describe('Core | Plugins | Children -', () => {
  let parentEl;
  let options;

  class CorePluginsChildren {}
  class CorePluginsChildrenParent {
    constructor() {
      this.items = wrappedChildren(CorePluginsChildren, options);
    }
  }

  function setupTree(opt) {
    options = opt;
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

    document.body.appendChild(parentEl);
  }

  beforeAll(() => {
    define({ CorePluginsChildren, CorePluginsChildrenParent });
  });

  afterEach(() => {
    if (parentEl && parentEl.parentElement) parentEl.parentElement.removeChild(parentEl);
    options = undefined;
  });

  it('throw for invalid arguments', () => {
    expect(() => children()).toThrow();
    expect(() => children(CorePluginsChildrenParent, 123)).toThrow();
  });

  it('throw for calling after created', () => {
    setupTree();
    expect(() => {
      children.call(parentEl, CorePluginsChildrenParent);
    }).toThrow();
  });

  rafIt('return direct children list', () => {
    setupTree();
    requestAnimationFrame(() => {
      expect(parentEl[CONTROLLER].items).toEqual(getControllers('*:not(div):not(span) >', parentEl));
    });
  });

  rafIt('return deep children list', () => {
    setupTree({ deep: true });
    requestAnimationFrame(() => {
      expect(parentEl[CONTROLLER].items).toEqual(getControllers('*:not(span) >', parentEl));
    });
  });

  rafIt('return nested deep children list', () => {
    setupTree({ deep: true, nested: true });
    requestAnimationFrame(() => {
      expect(parentEl[CONTROLLER].items).toEqual(getControllers('', parentEl));
    });
  });

  rafIt('return children list when only nested selected', () => {
    setupTree({ nested: true });
    requestAnimationFrame(() => {
      expect(parentEl[CONTROLLER].items).toEqual(getControllers('*:not(div):not(span) >', parentEl));
    });
  });

  it('update children list for DOM changes before', (done) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        parentEl.removeChild(parentEl.children[0]);
        parentEl.insertBefore(parentEl.children[1], null);

        requestAnimationFrame(() => {
          expect(parentEl[CONTROLLER].items).toEqual(getControllers('*:not(div):not(span) >', parentEl));
          done();
        });
      });
    });
  });
});

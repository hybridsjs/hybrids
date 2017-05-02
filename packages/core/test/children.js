import { define, CONTROLLER } from '../src/index';
import wrappedChildren, { children } from '../src/children';

function getControllers(prefix, node) {
  return Array.from(node.querySelectorAll(`${prefix} core-plugins-children`.trim()))
    .map(child => child[CONTROLLER]);
}

describe('core | children -', () => {
  let parentEl;
  let options;

  class CorePluginsChildren {}
  class CorePluginsChildrenParent {
    constructor() {
      wrappedChildren('items', CorePluginsChildren, options);
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

  it('throws for invalid arguments', () => {
    expect(() => children()).toThrow();
    expect(() => children(CorePluginsChildrenParent, 123)).toThrow();
  });

  it('throws for calling after created', () => {
    setupTree();
    expect(() => {
      children.call(parentEl, CorePluginsChildrenParent);
    }).toThrow();
  });

  rafIt('returns direct children list', () => {
    setupTree();
    requestAnimationFrame(() => {
      expect(parentEl[CONTROLLER].items).toEqual(getControllers('*:not(div):not(span) >', parentEl));
    });
  });

  rafIt('returns deep children list', () => {
    setupTree({ deep: true });
    requestAnimationFrame(() => {
      expect(parentEl[CONTROLLER].items).toEqual(getControllers('*:not(span) >', parentEl));
    });
  });

  rafIt('returns nested deep children list', () => {
    setupTree({ deep: true, nested: true });
    requestAnimationFrame(() => {
      expect(parentEl[CONTROLLER].items).toEqual(getControllers('', parentEl));
    });
  });

  rafIt('returns children list when only nested selected', () => {
    setupTree({ nested: true });
    requestAnimationFrame(() => {
      expect(parentEl[CONTROLLER].items).toEqual(getControllers('*:not(div):not(span) >', parentEl));
    });
  });

  it('updates children list for DOM changes before', (done) => {
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

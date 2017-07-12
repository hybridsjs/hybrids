import parent from '../../../src/bindings/parent';

describe('Binding parent', () => {
  class ParentTest {
    constructor() {
      this.value = 'test';
    }
  }

  class ChildTest {
    static component = {
      bindings: {
        parent: parent(ParentTest),
      },
    }

    // eslint-disable-next-line
    changed() {}
  }

  test(class {
    static component = {
      define: { ParentTest, ChildTest },
      template: `
        <parent-test id="parent">
          <div>
            <child-test id="child"></child-test>
          </div>
        </parent-test>
        <child-test id="orphan"></child-test>
      `,
    }
  }, {
    'returns parent controller': (el) => {
      const parentComponent = getComponent(el, 'parent');
      const childComponent = getComponent(el, 'child');

      expect(childComponent.parent).toBe(parentComponent);
    },
    'returns null when no parent is available': (el) => {
      expect(getComponent(el, 'orphan').parent).toBe(null);
    },
    'disconnects parent from component': (el) => {
      const parentComponent = getComponent(el, 'parent');
      const childComponent = getComponent(el, 'child');
      const childEl = getElement(el, 'child');
      const parentEl = childEl.parentElement;

      parentEl.removeChild(childEl);
      expect(childComponent.parent).toBe(null);

      parentEl.appendChild(childEl);

      return (done) => {
        expect(childComponent.parent).toBe(parentComponent);
        done();
      };
    },
    'calls changed method of the component when parent changes': (el) => {
      const parentComponent = getComponent(el, 'parent');
      const childComponent = getComponent(el, 'child');
      const spy = spyOn(childComponent, 'changed');

      parentComponent.value = 'new value';

      return (done) => {
        expect(spy).toHaveBeenCalledTimes(1);
        done();
      };
    },
  });
});

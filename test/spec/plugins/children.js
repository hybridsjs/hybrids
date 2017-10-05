import children from '../../../src/plugins/children';

describe('Plugin Children:', () => {
  class ChildrenTest {
    constructor() {
      this.test = undefined;
    }
  }

  describe('direct children', () => {
    const test = hybrid(class {
      static view = {
        define: {
          ParentDirectTest: class {
            static properties = {
              children: children(ChildrenTest),
            };
          },
          ChildrenTest,
        },
        template: `
          <parent-direct-test id="parent">
            <children-test id="child">
              <children-test></children-test>
            </children-test>
            <div>
              <children-test></children-test>
            </div>
          </parent-direct-test>
        `,
      };
    });

    it('connects to list', test(({ getComponent }) => {
      const parent = getComponent('parent');
      const child = getComponent('child');
      expect(parent.children.length).toBe(1);
      expect(parent.children[0]).toBe(child);
    }));

    it('removes component from list', test(({ getComponent, getElement }) => {
      const parent = getComponent('parent');
      const child = getElement('child');

      child.parentElement.removeChild(child);

      return (done) => {
        expect(parent.children).toEqual([]);
        done();
      };
    }));
  });

  describe('deep children', () => {
    const test = hybrid(class {
      static view = {
        define: {
          ParentDeepTest: class {
            static properties = {
              children: children(ChildrenTest, { deep: true }),
            };
          },
          ChildrenTest,
        },
        template: `
          <parent-deep-test id="parent">
            <children-test id="childOne">
              <children-test></children-test>
            </children-test>
            <div>
              <children-test id="childTwo"></children-test>
            </div>
          </parent-deep-test>
        `,
      };
    });

    it('connects to list', test(({ getComponent }) => {
      const parent = getComponent('parent');
      const childOne = getComponent('childOne');
      const childTwo = getComponent('childTwo');
      expect(parent.children.length).toBe(2);
      expect(parent.children[0]).toBe(childOne);
      expect(parent.children[1]).toBe(childTwo);
    }));

    it('removes component from list', test(({ getComponent, getElement }) => {
      const parent = getComponent('parent');
      const childOne = getComponent('childOne');
      const childTwo = getElement('childTwo');

      childTwo.parentElement.removeChild(childTwo);

      return (done) => {
        expect(parent.children.length).toBe(1);
        expect(parent.children[0]).toBe(childOne);
        done();
      };
    }));
  });

  describe('nested children', () => {
    const test = hybrid(class {
      static view = {
        define: {
          ParentNestedTest: class {
            static properties = {
              children: children(ChildrenTest, { deep: true, nested: true }),
            };
          },
          ChildrenTest,
        },
        template: `
          <parent-nested-test id="parent">
            <children-test id="childOne">
              <children-test id="childTwo"></children-test>
            </children-test>
            <div>
              <children-test id="childThree"></children-test>
            </div>
          </parent-nested-test>
        `,
      };
    });

    it('connects to list', test(({ getComponent }) => {
      const parent = getComponent('parent');
      const childOne = getComponent('childOne');
      const childTwo = getComponent('childTwo');
      const childThree = getComponent('childThree');
      expect(parent.children.length).toBe(3);
      expect(parent.children[0]).toBe(childOne);
      expect(parent.children[1]).toBe(childTwo);
      expect(parent.children[2]).toBe(childThree);
    }));

    it('removes component from list', test(({ getComponent, getElement }) => {
      const parent = getComponent('parent');
      const childOne = getComponent('childOne');
      const childTwo = getComponent('childTwo');
      const childThree = getElement('childThree');

      childThree.parentElement.removeChild(childThree);

      return (done) => {
        expect(parent.children.length).toBe(2);
        expect(parent.children[0]).toBe(childOne);
        expect(parent.children[1]).toBe(childTwo);
        done();
      };
    }));
  });

  describe('change parent', () => {
    const test = hybrid(class {
      static view = {
        define: {
          ParentUpdateTest: class {
            static properties = {
              children: children(ChildrenTest),
            };

            changed() {} // eslint-disable-line
          },
          ChildrenTest,
        },
        template: `
          <parent-update-test id="parent">
            <children-test id="child"></children-test>
          </parent-update-test>
        `,
      };
    });

    it('by children change', test(({ getComponent }) => {
      const parentComponent = getComponent('parent');
      parentComponent.changed = jasmine.createSpy('changed');

      const child = getComponent('child');
      child.test = 'test';

      return (done) => {
        expect(parentComponent.changed).toHaveBeenCalledTimes(1);
        done();
      };
    }));
  });
});

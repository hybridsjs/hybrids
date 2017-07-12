import { COMPONENT } from '../../../src/symbols';
import property from '../../../src/bindings/property';
import children from '../../../src/bindings/children';

describe('Children binding', () => {
  const getElement = (el, id) => el.shadowRoot.getElementById(id);
  const getComponent = (el, id) => getElement(el, id)[COMPONENT];

  class ChildrenTest {
    static component = {
      bindings: {
        test: property(),
      },
    };
  }

  describe('direct children', () => {
    test(class {
      static component = {
        define: {
          ParentDirectTest: class {
            static component = {
              bindings: {
                childs: children(ChildrenTest),
              },
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
    }, {
      'connects to list': (el) => {
        const parent = getComponent(el, 'parent');
        const child = getComponent(el, 'child');
        expect(parent.childs.length).toBe(1);
        expect(parent.childs[0]).toBe(child);
      },
      'removes component from list': (el) => {
        const parent = getComponent(el, 'parent');
        const child = getElement(el, 'child');

        child.parentElement.removeChild(child);

        return (done) => {
          expect(parent.childs).toEqual([]);
          done();
        };
      },
    });
  });

  describe('deep children', () => {
    test(class {
      static component = {
        define: {
          ParentDeepTest: class {
            static component = {
              bindings: {
                childs: children(ChildrenTest, { deep: true }),
              },
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
    }, {
      'connects to list': (el) => {
        const parent = getComponent(el, 'parent');
        const childOne = getComponent(el, 'childOne');
        const childTwo = getComponent(el, 'childTwo');
        expect(parent.childs.length).toBe(2);
        expect(parent.childs[0]).toBe(childOne);
        expect(parent.childs[1]).toBe(childTwo);
      },
      'removes component from list': (el) => {
        const parent = getComponent(el, 'parent');
        const childOne = getComponent(el, 'childOne');
        const childTwo = getElement(el, 'childTwo');

        childTwo.parentElement.removeChild(childTwo);

        return (done) => {
          expect(parent.childs.length).toBe(1);
          expect(parent.childs[0]).toBe(childOne);
          done();
        };
      },
    });
  });

  describe('nested children', () => {
    test(class {
      static component = {
        define: {
          ParentNestedTest: class {
            static component = {
              bindings: {
                childs: children(ChildrenTest, { deep: true, nested: true }),
              },
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
    }, {
      'connects to list': (el) => {
        const parent = getComponent(el, 'parent');
        const childOne = getComponent(el, 'childOne');
        const childTwo = getComponent(el, 'childTwo');
        const childThree = getComponent(el, 'childThree');
        expect(parent.childs.length).toBe(3);
        expect(parent.childs[0]).toBe(childOne);
        expect(parent.childs[1]).toBe(childTwo);
        expect(parent.childs[2]).toBe(childThree);
      },
      'removes component from list': (el) => {
        const parent = getComponent(el, 'parent');
        const childOne = getComponent(el, 'childOne');
        const childTwo = getComponent(el, 'childTwo');
        const childThree = getElement(el, 'childThree');

        childThree.parentElement.removeChild(childThree);

        return (done) => {
          expect(parent.childs.length).toBe(2);
          expect(parent.childs[0]).toBe(childOne);
          expect(parent.childs[1]).toBe(childTwo);
          done();
        };
      },
    });
  });

  test(class {
    static component = {
      define: {
        ParentUpdateTest: class {
          static component = {
            bindings: {
              childs: children(ChildrenTest),
            },
          };

          // eslint-disable-next-line
          changed() {}
        },
        ChildrenTest,
      },
      template: `
        <parent-update-test id="parent">
          <children-test id="child"></children-test>
        </parent-update-test>
      `,
    };
  }, {
    'update parent by children update': (el) => {
      const parent = getComponent(el, 'parent');
      const child = getElement(el, 'child');
      const spy = spyOn(parent, 'changed');

      return (done) => {
        child.test = 'test';
        global.requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalledTimes(1);
          done();
        });
      };
    },
  });
});

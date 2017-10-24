import parent from '../../../src/plugins/parent';

describe('Plugin Parent:', () => {
  class ParentTest {
    constructor() {
      this.value = 'test';
    }
  }

  class ChildTest {
    static plugins = {
      parent: parent(ParentTest),
    };

    changed() {} // eslint-disable-line
  }

  const test = hybrid(class {
    static view = {
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
  });

  it('returns parent controller', test(({ getComponent }) => {
    const parentComponent = getComponent('parent');
    const childComponent = getComponent('child');

    expect(childComponent.parent).toBe(parentComponent);
  }));

  it('returns null when no parent is available', test(({ getComponent }) => {
    expect(getComponent('orphan').parent).toBe(null);
  }));

  it('returns null when disconnects child', test(({ getComponent, getElement }) => {
    // const parentComponent = getComponent('parent');
    const childComponent = getComponent('child');
    const childEl = getElement('child');
    const parentEl = childEl.parentElement;

    parentEl.removeChild(childEl);

    return (done) => {
      expect(childComponent.parent).toBe(null);
      done();
    };
  }));

  it('trigger change of the component when parent changes', test(({ getComponent }) => {
    const parentComponent = getComponent('parent');
    const childComponent = getComponent('child');

    childComponent.changed = jasmine.createSpy('changed');

    parentComponent.value = 'new value';

    return (done) => {
      expect(childComponent.changed).toHaveBeenCalledTimes(1);
      expect(childComponent.parent).toBe(parentComponent);
      done();
    };
  }));
});

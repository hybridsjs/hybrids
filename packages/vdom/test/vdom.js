import { define, CONTROLLER } from '@hybrids/core';
import { vdom } from '../src';

describe('vdom |', () => {
  const vnode = {};
  let options;
  let spy;
  let el;

  beforeAll(() => {
    options = {
      plugins: [vdom], properties: ['items'], render: (...args) => spy(...args)
    };

    class VirtualComponentTest {
      static get options() { return options; }

      constructor() {
        this.static = 'some value';
        this.items = [1, 2, 3, 4];
      }

      render() { return vnode; }

      someAction() { return this; }
    }

    define({ VirtualComponentTest });
  });

  beforeEach(() => {
    spy = jasmine.createSpy('render');
    el = document.createElement('virtual-component-test');
    document.body.appendChild(el);
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  it('throws when render is not defined', () => {
    expect(() => define('virtual-component-without-render', class {
      static get options() { return { plugins: [vdom] }; }
    })).toThrow();
  });

  it('autobinds prototype methods', () => {
    const fn = el[CONTROLLER].someAction;
    expect(fn()).toEqual(el[CONTROLLER]);
  });

  it('not autobinds when options set to false', () => {
    define('virtual-component-not-autobind', class {
      static get options() { return { plugins: [vdom], autobind: false }; }
      render() {}
      someAction() { return this; }
    });

    const myEl = document.createElement('virtual-component-not-autobind');
    const fn = myEl[CONTROLLER].someAction;

    expect(fn()).not.toEqual(null);
  });

  rafIt('calls render when initialized', () => {
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.mostRecent().args[0]).toEqual(vnode);
  });

  rafIt('calls render when primitive value changes', () => {
    el[CONTROLLER].static = 'new value';

    requestAnimationFrame(() => {
      expect(spy.calls.count()).toEqual(2);
    });
  });

  rafIt('calls render when object value changes', () => {
    el[CONTROLLER].items.push(5);

    requestAnimationFrame(() => {
      expect(spy.calls.count()).toEqual(2);
    });
  });
});

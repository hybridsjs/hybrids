import Expression, { getOwnLocals, defineLocals, LOCALS_PREFIX as L } from '../src/expression';
import Path from '../src/path';

describe('Engine | Expression -', () => {
  let path;
  let el;
  let context;
  let expr;

  beforeEach(() => {
    el = document.createElement('div');
  });

  describe('get/set with context', () => {
    beforeEach(() => {
      path = new Path('one.two');
      context = { one: { two: 'value' } };
      expr = new Expression(el, context, path);
    });

    it('has evaluate', () => {
      expect(expr.evaluate).toEqual('one.two');
    });

    it('get value', () => {
      expect(expr.get()).toEqual('value');
    });

    it('set default value with set replace to false', () => {
      delete context.one.two;
      expr.set('new value', false);
      expect(expr.get()).toEqual('new value');
    });

    it('not replace value with set replace to false', () => {
      expr.set('new value', false);
      expect(expr.get()).toEqual('value');
    });

    it('set value', () => {
      expr.set('new value');
      expect(expr.get()).toEqual('new value');
    });
  });

  describe('get/set with filters', () => {
    let spy;

    beforeEach(() => {
      spy = jasmine.createSpy('filter');
      path = new Path('one.two');
      context = { one: { two: 0 } };
      expr = new Expression(el, context, path, [(val) => { spy(val); return val + 1; }]);
    });

    it('get value', () => {
      expect(expr.get()).toEqual(1);
      expect(spy).toHaveBeenCalled();
    });

    it('not set value with set replace to false', () => {
      expr.set('new value', false);
      expect(expr.get()).toEqual(1);
      expect(spy).toHaveBeenCalled();
    });

    it('set value', () => {
      expr.set(2);
      expect(spy).toHaveBeenCalled();
      expect(expr.get()).toEqual(4);
    });
  });

  describe('get/set with locals', () => {
    beforeEach(() => {
      path = new Path(`${L}one.two`);
      defineLocals(el, { one: { two: 'value' } });
      expr = new Expression(el, context, path);
    });

    it('get value', () => {
      expect(expr.get()).toEqual('value');
    });

    it('not set value without set replace', () => {
      expr.set('new value', false);
      expect(expr.get()).toEqual('value');
    });

    it('set value', () => {
      expr.set('new value');
      expect(expr.get()).toEqual('new value');
    });
  });

  describe('get/set with root property local', () => {
    beforeEach(() => {
      path = new Path(`${L}one`);
      defineLocals(el, { one: 'value' });
      expr = new Expression(el, context, path);
    });

    it('not set value without set replace', () => {
      expect(() => expr.set('new value')).toThrow();
    });

    it('not set value with set replace', () => {
      expect(() => expr.set('new value', true)).toThrow();
    });
  });

  describe('get/set with inherit locals', () => {
    let parent;

    beforeEach(() => {
      path = new Path(`${L}one`);
      parent = document.createElement('div');
      parent.appendChild(el);
      expr = new Expression(el, context, path);
    });

    it('get local', () => {
      defineLocals(parent, { one: 'value' });
      expect(expr.get()).toEqual('value');
    });
  });

  describe('get/set with computed path', () => {
    beforeEach(() => {
      path = new Path('one.two()');
      context = { one: { two: () => 'test' } };
      spyOn(context.one, 'two').and.returnValue('test');
      expr = new Expression(el, context, path);
    });

    it('get value by calling method', () => {
      expect(expr.get()).toEqual('test');
      expect(context.one.two).toHaveBeenCalled();
    });

    it('throw error for setting value', () => {
      expect(() => expr.set('test')).toThrow();
    });

    it('call with arguments', () => {
      expr.get({ one: 'one', two: 'two' });
      expect(context.one.two.calls.mostRecent().object).toEqual(context.one);
      expect(context.one.two.calls.mostRecent().args).toEqual([{ one: 'one', two: 'two' }]);
    });

    it('call with locals', () => {
      defineLocals(el, { test: 'value', two: 1 });
      expr.get({ one: 'one', two: 'two' });
      expect(context.one.two.calls.mostRecent().args).toEqual([
        { one: 'one', two: 'two', test: 'value' }
      ]);
    });

    it('call with merged locals', () => {
      const parent = document.createElement('div');
      parent.appendChild(el);

      defineLocals(parent, { test: 'parent value', parent: true });
      defineLocals(el, { test: 'value', two: 1 });

      expr.get({ one: 'one', two: 'two' });

      expect(context.one.two.calls.mostRecent().args).toEqual([
        { one: 'one', two: 'two', test: 'value', parent: true }
      ]);
    });
  });

  describe('getOwnLocals', () => {
    let parent;
    beforeEach(() => {
      parent = document.createElement('div');
      parent.appendChild(el);

      defineLocals(parent, { test: 'one', two: 'two' });
      defineLocals(el, { test: 'other value', three: 'three' });
    });

    it('get only own locals', () => {
      expect(getOwnLocals(el)).toEqual({ test: 'other value', three: 'three' });
      expect(getOwnLocals(parent)).toEqual({ test: 'one', two: 'two' });
    });

    it('return empty when no locals', () => {
      expect(getOwnLocals(document.createElement('div'))).toEqual({});
    });
  });
});

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

    it('not set value without set replace', () => {
      expr.set('new value');
      expect(expr.get()).toEqual('value');
    });

    it('set value with set replace', () => {
      expr.set('new value', true);
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

    it('not set value without set replace', () => {
      expr.set('new value');
      expect(expr.get()).toEqual(1);
      expect(spy).toHaveBeenCalled();
    });

    it('set value with set replace', () => {
      expr.set(2, true);
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
      expr.set('new value');
      expect(expr.get()).toEqual('value');
    });

    it('set value with set replace', () => {
      expr.set('new value', true);
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
      expr.set('new value');
      expect(expr.get()).toEqual('value');
    });

    it('not set value with set replace', () => {
      expr.set('new value', true);
      expect(expr.get()).toEqual('value');
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

    it('throw for empty inherti locals', () => {
      expect(() => expr.get()).toThrow();
    });
  });

  describe('call method', () => {
    let spy;

    beforeEach(() => {
      spy = jasmine.createSpy('two');
      path = new Path('one.two');
      context = { one: { two: spy } };
      expr = new Expression(el, context, path);
    });

    it('call with arguments', () => {
      expr.call('one', 'two');
      expect(spy.calls.mostRecent().object).toEqual(context.one);
      expect(spy.calls.mostRecent().args).toEqual(['one', 'two', {}]);
    });

    it('call with locals', () => {
      defineLocals(el, { test: 'value', other: 1 });
      expr.call('one', 'two');
      expect(spy.calls.mostRecent().object).toEqual(context.one);
      expect(spy.calls.mostRecent().args).toEqual([
        'one', 'two', { test: 'value', other: 1 }
      ]);
    });

    it('call with merged locals', () => {
      const parent = document.createElement('div');
      parent.appendChild(el);

      defineLocals(parent, { test: 'parent value', parent: true });
      defineLocals(el, { test: 'value', other: 1 });

      expr.call('one', 'two');

      expect(spy.calls.mostRecent().args).toEqual([
        'one', 'two', { test: 'value', other: 1, parent: true }
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

import Expression, { setNodeContext } from '../../src/template/expression';
import Path from '../../src/template/path';

describe('Template Expression:', () => {
  let path;
  let el;
  let context;
  let expr;

  beforeEach(() => {
    el = document.createElement('div');
  });

  describe('get/set with context -', () => {
    beforeEach(() => {
      path = new Path('one.two');
      context = { one: { two: 'value' } };
      expr = new Expression(el, path);

      setNodeContext(el, context);
    });

    it('has evaluate', () => {
      expect(expr.evaluate).toEqual('one.two');
    });

    it('gets value', () => {
      expect(expr.get()).toEqual('value');
    });

    it('sets default value with set replace to false', () => {
      delete context.one.two;
      expr.set('new value', false);
      expect(expr.get()).toEqual('new value');
    });

    it('not replaces value with set replace to false', () => {
      expr.set('new value', false);
      expect(expr.get()).toEqual('value');
    });

    it('sets value', () => {
      expr.set('new value');
      expect(expr.get()).toEqual('new value');
    });
  });

  describe('get/set with filters -', () => {
    let spy;

    beforeEach(() => {
      spy = jasmine.createSpy('filter');
      path = new Path('one.two');
      context = { one: { two: 0 } };
      expr = new Expression(el, path, [(val) => { spy(val); return val + 1; }]);
      setNodeContext(el, context);
    });

    it('gets value', () => {
      expect(expr.get()).toEqual(1);
      expect(spy).toHaveBeenCalled();
    });

    it('not sets value with set replace to false', () => {
      expr.set('new value', false);
      expect(expr.get()).toEqual(1);
      expect(spy).toHaveBeenCalled();
    });

    it('sets value', () => {
      expr.set(2);
      expect(spy).toHaveBeenCalled();
      expect(expr.get()).toEqual(4);
    });
  });

  describe('get/set with inherit locals -', () => {
    let parent;

    beforeEach(() => {
      path = new Path('one');
      parent = document.createElement('div');
      parent.appendChild(el);
      expr = new Expression(el, path);
    });

    it('gets local', () => {
      setNodeContext(parent, { one: 'value' });
      expect(expr.get()).toEqual('value');
    });
  });

  describe('call -', () => {
    beforeEach(() => {
      path = new Path('one.two');
      context = { one: { two: () => 'test' } };
      spyOn(context.one, 'two').and.returnValue('test');
      expr = new Expression(el, path);
      setNodeContext(el, context);
    });

    it('gets value by calling method', () => {
      expect(expr.call()).toEqual('test');
      expect(context.one.two).toHaveBeenCalled();
    });

    it('calls with merged context and arguments', () => {
      expr.call({ one: 'one', two: 'two' });
      expect(context.one.two.calls.mostRecent().object).toEqual(context.one);
      expect(context.one.two.calls.mostRecent().args).toEqual([context, { one: 'one', two: 'two' }]);
    });

    it('calls with locals', () => {
      const parent = document.createElement('div');
      const parentContext = { one: 'other value', test: 'value', two: 1 };
      parent.appendChild(el);
      setNodeContext(parent, parentContext);

      expr.call({ one: 'one', two: 'two' });

      expect(context.one.two.calls.mostRecent().args).toEqual([
        { ...parentContext, ...context }, { one: 'one', two: 'two' },
      ]);
    });
  });
});

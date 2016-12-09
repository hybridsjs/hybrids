import Path from '../src/path';

describe('Engine | Path -', () => {
  let context;

  it('throw for empty input', () => {
    expect(() => new Path('')).toThrow();
  });

  it('create from serialized object', () => {
    const path = new Path('a.b.c');
    const serialized = Object.assign({}, path);
    const copy = new Path(serialized);

    expect(copy.path).toEqual(path.path);
  });

  describe('`get` method', () => {
    beforeEach(() => {
      context = {
        one: { two: { three: 'four' } },
        arr: [1, { two: ['three'] }]
      };
    });

    it('returns path value', () => {
      const path1 = new Path('one.two.three');
      const path2 = new Path('arr[1].two[0]');
      expect(path1.get(context)).toEqual('four');
      expect(path2.get(context)).toEqual('three');
    });

    it('return undefined for not defined root property', () => {
      const path = new Path('other.thing');
      expect(path.get(context)).toBeUndefined();
    });

    it('throws for invalid type of property path', () => {
      const path = new Path('one.two.three.four');
      expect(() => path.get(context)).toThrow();
    });
  });

  describe('`set` method', () => {
    beforeEach(() => {
      context = { asd: {}, qwe: 123 };
    });

    it('create property path', () => {
      const path = new Path('asd.dsa.qwe');
      path.set(context, 'new Value');

      expect(context.asd.dsa.qwe).toEqual('new Value');
    });

    it('not create property path when replace set to false', () => {
      const path = new Path('qwe');
      path.set(context, 'new Value', false);

      expect(context.qwe).toEqual(123);
    });

    it('set property', () => {
      const path = new Path('qwe');
      path.set(context, 'new Value');

      expect(context.qwe).toEqual('new Value');
    });

    it('throws for invalid type of property path', () => {
      const path = new Path('qwe.value');
      expect(() => path.set(context, 'test')).toThrow();
    });
  });

  describe('`call` method', () => {
    let spy;

    beforeEach(() => {
      spy = jasmine.createSpy('callback');
      context = { a: 'string', b: { c: spy, d: 'test' } };
    });

    it('throws for not function', () => {
      const path = new Path('a');
      const fn = () => path.call(context);
      expect(fn).toThrow();
    });

    it('throws for not function when nested', () => {
      const path = new Path('b.d.e');
      const fn = () => path.call(context);
      expect(fn).toThrow();
    });

    it('calls function with proper context', () => {
      const path = new Path('b.c');
      path.call(context, 'test1', 'test2');
      expect(spy.calls.mostRecent().object).toEqual(context.b);
      expect(spy.calls.mostRecent().args).toEqual(['test1', 'test2']);
    });
  });

  describe('`delete` method', () => {
    beforeEach(() => {
      context = {
        a: { b: { c: 'test' } },
        e: {
          f: 'test',
          g: { h: 'test' }
        }
      };
    });

    it('removes path with one key in chain', () => {
      const path = new Path('a.b.c');
      path.delete(context);

      expect(context.a).toBeUndefined();
    });

    it('not removes path when more keys are in chain', () => {
      const path = new Path('e.g.h');
      path.delete(context);

      expect(context.e).toEqual({ f: 'test' });
    });

    it('return for not defined property', () => {
      const path = new Path('c.b.a');
      path.delete(context);

      expect(context.c).toBeUndefined();
    });
  });
});

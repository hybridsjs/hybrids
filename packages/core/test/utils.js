import {
  camelToDash, pascalToDash, dashToCamel, reflectValue, normalizeProperty, queue
} from '../src/utils';

describe('core | utils -', () => {
  it('camelToDash', () => {
    expect(camelToDash('AsdDsa')).toEqual('asd-dsa');
  });

  it('pascalToDash', () => {
    expect(pascalToDash('AsdDsa')).toEqual('asd-dsa');
    expect(pascalToDash('XContent')).toEqual('x-content');
  });

  it('dashToCamel', () => {
    expect(dashToCamel('asd-dsa')).toEqual('asdDsa');
  });

  describe('reflectValue -', () => {
    it('returns value when equal', () => {
      const val = {};
      expect(reflectValue(val, 'object')).toEqual(val);
    });

    it('reflects basic types', () => {
      expect(reflectValue(123, 'string')).toEqual('123');
      expect(reflectValue('123', 'number')).toEqual(123);
      expect(reflectValue(123, 'boolean')).toEqual(true);
      expect(reflectValue(123, 'undefined')).toEqual(123);
    });

    it('reflects function type', () => {
      const val = () => {};
      expect(reflectValue(val, 'function')).toEqual(val);
      expect(() => reflectValue('asd', 'function')).toThrow();
    });

    it('reflects object type', () => {
      const val = { test: 'asd' };
      expect(reflectValue(val, 'object')).toEqual(val);
      expect(reflectValue(null, 'object')).toEqual(null);
      expect(reflectValue('{ "test": "asd" }', 'object')).toEqual(val);
      expect(() => reflectValue('asd', 'object')).toThrow();
      expect(() => reflectValue('1', 'object')).toThrow();
      expect(() => reflectValue(1, 'object')).toThrow();
    });
  });

  it('normalizeProperty', () => {
    expect(normalizeProperty('test')).toEqual({
      property: 'test', attr: 'test',
    });
    expect(normalizeProperty({ property: 'test' })).toEqual({
      property: 'test', attr: 'test',
    });
    expect(normalizeProperty({ property: 'test', attr: 'other-test' })).toEqual({
      property: 'test', attr: 'other-test',
    });
    expect(() => normalizeProperty(false)).toThrow();
  });

  it('queue', (done) => {
    const spy = jasmine.createSpy();

    queue(() => spy('one'));
    queue(() => spy('two'));

    Promise.resolve().then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.first().args[0]).toEqual('two');
      expect(spy.calls.mostRecent().args[0]).toEqual('one');
      done();
    });
  });
});

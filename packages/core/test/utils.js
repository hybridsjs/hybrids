import {
  camelToDash, dashToCamel, reflectValue, reflectBoolAttribute, normalizeProperty, queue
} from '../src/utils';

describe('Core | Utils -', () => {
  it('camelToDash', () => {
    expect(camelToDash('AsdDsa')).toEqual('asd-dsa');
  });

  it('dashToCamel', () => {
    expect(dashToCamel('asd-dsa')).toEqual('asdDsa');
  });

  describe('reflectValue', () => {
    it('returns value when equal', () => {
      const val = {};
      expect(reflectValue(val, val)).toEqual(val);
    });

    it('reflects basic types', () => {
      expect(reflectValue(123, '')).toEqual('123');
      expect(reflectValue('123', 0)).toEqual(123);
      expect(reflectValue(123, false)).toEqual(true);
      expect(reflectValue(123, undefined)).toEqual(123);
    });

    it('reflects function type', () => {
      const val = () => {};
      expect(reflectValue(val, () => {})).toEqual(val);
      expect(() => reflectValue('asd', () => {})).toThrow();
    });

    it('reflects object type', () => {
      const val = { test: 'asd' };
      expect(reflectValue(val, {})).toEqual(val);
      expect(reflectValue(null, {})).toEqual(null);
      expect(reflectValue('{ "test": "asd" }', {})).toEqual(val);
      expect(() => reflectValue('asd', {})).toThrow();
      expect(() => reflectValue('1', {})).toThrow();
      expect(() => reflectValue(1, {})).toThrow();
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

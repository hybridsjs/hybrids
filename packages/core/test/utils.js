import {
  camelToDash, dashToCamel, reflectValue, reflectBoolAttribute, normalizeProperty, queue, shedule
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

  it('reflectBoolAttribute', () => {
    const el = document.createElement('div');

    reflectBoolAttribute.call(el, 'test', false);
    expect(el.hasAttribute('test')).toEqual(false);

    reflectBoolAttribute.call(el, 'test', true);
    expect(el.hasAttribute('test')).toEqual(true);
    expect(el.getAttribute('test')).toEqual('');

    reflectBoolAttribute.call(el, 'test', {});
    expect(el.hasAttribute('test')).toEqual(true);
    expect(el.getAttribute('test')).toEqual('');

    reflectBoolAttribute.call(el, 'test', false);
    expect(el.hasAttribute('test')).toEqual(false);
  });

  it('normalizeProperty', () => {
    expect(normalizeProperty('test')).toEqual({
      property: 'test', attr: 'test', reflect: true,
    });
    expect(normalizeProperty({ property: 'test' })).toEqual({
      property: 'test', attr: 'test', reflect: true,
    });
    expect(normalizeProperty({ property: 'test', attr: false })).toEqual({
      property: 'test', attr: false, reflect: false,
    });
    expect(normalizeProperty({ property: 'test', attr: 'other-test' })).toEqual({
      property: 'test', attr: 'other-test', reflect: true,
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

  it('shedule', (done) => {
    const spy = jasmine.createSpy();

    shedule(() => spy('one'));
    shedule(() => spy('two'));

    requestAnimationFrame(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.first().args[0]).toEqual('one');
      expect(spy.calls.mostRecent().args[0]).toEqual('two');
      done();
    });
  });
});

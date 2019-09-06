import { dashToCamel, getType, coerceToType } from '../../src/utils';

describe('dashToCamel', () => {
  it('converts dashed string to camel case', () => {
    expect(dashToCamel('foo-bar-baz')).toBe('fooBarBaz');
  });
  it('passes un-dashed string through unchanged', () => {
    expect(dashToCamel('fooBarBaz')).toBe('fooBarBaz');
  });
});

describe('getType', () => {
  describe('Number', () => {
    it('should return Number for a positive integer', () => {
      expect(getType(1)).toBe(Number);
    });
    it('should return Number for zero', () => {
      expect(getType(0)).toBe(Number);
    });
    it('should return Number for a negative integer', () => {
      expect(getType(-1)).toBe(Number);
    });
    it('should return Number for a float', () => {
      expect(getType(1.1)).toBe(Number);
    });
  });

  describe('Boolean', () => {
    it('should return Boolean for true', () => {
      expect(getType(true)).toBe(Boolean);
    });
    it('should return Boolean for false', () => {
      expect(getType(false)).toBe(Boolean);
    });
  });

  describe('Array', () => {
    it('should return Array for an array', () => {
      expect(getType([])).toBe(Array);
    });
  });

  describe('Undefined', () => {
    it('should return undefined for an undefined object', () => {
      expect(getType(undefined)).toBe(undefined);
    });
  });

  describe('Null', () => {
    it('should return null for a null object', () => {
      expect(getType(null)).toBe(null);
    });
  });

  describe('Object', () => {
    it('should return Object for an object', () => {
      expect(getType({})).toBe(Object);
    });
  });

  describe('Function', () => {
    it('should return Function for a function', () => {
      expect(getType(() => 'test')).toBe(Function);
    });
  });
});

describe('coerceToType', () => {
  describe('Number', () => {
    it('should return a Number', () => {
      expect(coerceToType(4, Number)).toBe(4);
      expect(coerceToType('4', Number)).toBe(4);
    });
  });

  describe('String', () => {
    it('should return a String', () => {
      expect(coerceToType(4, String)).toBe('4');
      expect(coerceToType('4', String)).toBe('4');
    })
  });

  describe('Boolean', () => {
    it('should return true', () => {
      expect(coerceToType('', Boolean)).toBe(true);
      expect(coerceToType('true', Boolean)).toBe(true);
      expect(coerceToType('stuff', Boolean)).toBe(true);
    });

    it('should return false', () => {
      expect(coerceToType(null, Boolean)).toBe(false);
      expect(coerceToType(undefined, Boolean)).toBe(false);
      expect(coerceToType('false', Boolean)).toBe(false);
    });
  });

  describe('Array', () => {
    it('should return an Array', () => {
      expect(coerceToType([1, 2], Array)).toEqual([1, 2]);
      expect(coerceToType('[1, 2]', Array)).toEqual([1, 2]);
      expect(coerceToType('1,2', Array)).toEqual([]);
      expect(coerceToType('stuff', Array)).toEqual([]);
    });
  });

  describe('Object', () => {
    it('should return an Object', () => {
      expect(coerceToType('{"a": "apple"}', Object)).toEqual({a: 'apple'});
    });
  });

  describe('Function', () => {
    it('should return undefined', () => {
      expect(coerceToType(() => 'test', Function)).toBe(undefined);
    });
  });

});

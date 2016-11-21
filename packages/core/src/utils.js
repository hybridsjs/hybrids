import { error } from '@hybrids/debug';

export function camelToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function dashToCamel(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

export function reflectValue(value, target) {
  if (value === target) {
    return target;
  }

  const type = typeof target;
  switch (type) {
    case 'string':
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return String(value);
    case 'number':
      return Number(value);
    case 'boolean':
      return Boolean(value);
    case 'object': {
      const valueType = typeof value;
      switch (valueType) {
        case 'object':
          return value !== null ? Object(value) : null;
        case 'string': {
          try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object') {
              return parsed;
            }
            throw new TypeError();
          } catch (e) {
            return error(e, "invalid type coercion from '%s' to '%s'", valueType, type);
          }
        }
        default:
          return error(TypeError, "invalid type coercion from '%s' to '%s'", valueType, type);
      }
    }
    default:
      return error(TypeError, "type coercion to '%s' not supported", type);
  }
}

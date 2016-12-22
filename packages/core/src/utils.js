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
    default: return value;
  }
}

export function reflectAttribute(attr, value) {
  if (typeof value === 'boolean') {
    if (value && !this.getAttribute(attr)) {
      this.setAttribute(attr, '');
    } else if (this.getAttribute(attr) !== null) {
      this.removeAttribute(attr);
    }
  }
}

export function normalizeProperty(property) {
  const type = typeof property;
  switch (type) {
    case 'string':
      return { property, attr: camelToDash(property), reflect: true };
    case 'object': {
      const desc = Object.assign({ attr: true, reflect: true }, property);
      if (desc.attr) {
        desc.attr = desc.attr !== true ? desc.attr : camelToDash(desc.property);
      }
      return desc;
    }
    default: return error(
      TypeError, '[core|define] Property description must be an object or string: %s', type
    );
  }
}

let tasks;
export function queue(fn) {
  if (!tasks) {
    tasks = [];

    Promise.resolve().then(() => {
      while (tasks[0]) {
        const task = tasks.shift();
        task();
      }
      tasks = null;
    });
  }

  tasks.unshift(fn);
}

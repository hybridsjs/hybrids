import { error } from './debug';

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
    case 'string': return String(value);
    case 'number': return Number(value);
    case 'boolean': return Boolean(value);
    case 'object': {
      const valueType = typeof value;
      switch (valueType) {
        case 'object':
          return value !== null ? Object(value) : null;
        case 'string': {
          try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object') return parsed;
            throw new TypeError();
          } catch (e) {
            return error(e, "reflect property: Invalid type coercion: '%valueType' to '%type'", { valueType, type });
          }
        }
        default:
          return error(TypeError, "reflect property: Invalid type coercion: '%valueType' to '%type'", { valueType, type });
      }
    }
    case 'undefined': return value;
    default: {
      const valueType = typeof value;
      if (valueType === type) return value;
      return error(TypeError, "reflect property: Invalid type coercion: '%valueType' to '%type'", { valueType, type });
    }
  }
}

export function reflectBoolAttribute(attr, value) {
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
      } else {
        desc.reflect = false;
      }
      return desc;
    }
    default: return error(
      TypeError, 'normalize property: Property description must be an object or string: %type', { type }
    );
  }
}

let queueTasks;
export function queue(fn) {
  if (!queueTasks) {
    queueTasks = [];

    Promise.resolve().then(() => {
      while (queueTasks[0]) {
        const task = queueTasks.shift();
        task();
      }
      queueTasks = null;
    });
  }

  queueTasks.unshift(fn);
}

let sheduleTasks;
export function shedule(cb) {
  if (!sheduleTasks) {
    sheduleTasks = new Set().add(cb);
    window.requestAnimationFrame(() => {
      sheduleTasks.forEach(c => c());
      sheduleTasks = undefined;
    });
  } else {
    sheduleTasks.add(cb);
  }
}

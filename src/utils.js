const camelToDashMap = new Map();
export function camelToDash(str) {
  let result = camelToDashMap.get(str);
  if (result === undefined) {
    result = str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    camelToDashMap.set(str, result);
  }
  return result;
}

export function pascalToDash(str) {
  return camelToDash(str.replace(/((?!([A-Z]{2}|^))[A-Z])/g, '-$1'));
}

export function dashToCamel(str) {
  return str.replace(/-([a-z])/g, c => c[1].toUpperCase());
}

export function dispatch(host, eventType, options = {}) {
  return host.dispatchEvent(new CustomEvent(eventType, { bubbles: false, ...options }));
}

export function shadyCSS(fn, fallback) {
  const shady = window.ShadyCSS;

  /* istanbul ignore next */
  if (shady && !shady.nativeShadow) {
    return fn(shady);
  }

  return fallback;
}

export function stringifyElement(element) {
  const tagName = String(element.tagName).toLowerCase();
  return `<${tagName}>`;
}

export const IS_IE = 'ActiveXObject' in window;
export const deferred = Promise.resolve();

export function setAttr(host, key, type, value) {
  const attr = camelToDash(key);
  switch (type) {
    case 'string':
    case 'number':
    case String:
    case Number:
      host.setAttribute(attr, value);
      break;
    case 'boolean':
    case Boolean:
      if (value) {
        host.setAttribute(attr, '');
      } else {
        host.removeAttribute(attr);
      }
      break;
    case 'function':
    case 'object':
      debugger;
      break;
    default: break;
  }
}

export function coerceValue(value, type) {
  switch (type) {
    case String:
    case Number:
      return type(value);
    case Boolean:
      if (value === 'false' || (!value && value !== '')) return false;
      return true;
    case Object:
    case Function:
      debugger;
      return undefined;
    default: return undefined;
  }
}

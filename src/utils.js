export function camelToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function pascalToDash(str) {
  str = str[0].toLowerCase() + str.slice(1);
  return camelToDash(str);
}

export function dispatch(host, eventType, options = {}) {
  host.dispatchEvent(new CustomEvent(eventType, { bubbles: false, ...options }));
}

export function createMap() {
  const map = new WeakMap();

  return {
    get(key, defaultValue) {
      if (map.has(key)) {
        return map.get(key);
      }

      if (defaultValue !== undefined) {
        map.set(key, defaultValue);
      }

      return defaultValue;
    },
    set(key, value) {
      map.set(key, value);
      return value;
    },
  };
}

export function shadyCSS(fn, fallback) {
  const shady = window.ShadyCSS;
  if (shady && !shady.nativeShadow) {
    return fn(shady);
  }

  return fallback;
}

export const IS_IE = 'ActiveXObject' in global;

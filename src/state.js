export default class State {
  constructor() {
    this.cache = new WeakMap();
    this.values = new WeakMap();
  }

  diff(target, cacheTarget = target) {
    target = target || {};

    const cache = this.cache.get(cacheTarget) || {};
    const values = this.values.get(cacheTarget);

    const nextCache = {};
    const nextValues = new Map();

    this.cache.set(target, nextCache);
    this.values.set(target, nextValues);

    const log = Object.keys(cache).reduce((acc, key) => {
      if (!{}.hasOwnProperty.call(target, key)) {
        acc = acc || {};
        acc[key] = { type: 'delete', oldValue: cache[key] };
      }
      return acc;
    }, null);

    return Object.keys(target).reduce((acc, key) => {
      const value = target[key];
      const oldValue = cache[key];

      if (!Object.is(value, oldValue)) {
        acc = acc || {};
        acc[key] = { ...acc[key], type: 'set', oldValue, value };

        if (values) {
          const oldKeys = values.get(value);
          if (oldKeys) {
            const oldKey = oldKeys.shift();
            if (oldKey !== undefined && oldKey !== key && target[oldKey] !== value) {
              acc[key].oldKey = oldKey;
              acc[oldKey] = { ...acc[oldKey], newKey: key };
            }
          }
        }
      }

      const keyList = nextValues.get(value) || [];
      keyList.push(key);
      nextValues.set(value, keyList);

      nextCache[key] = value;
      return acc;
    }, log);
  }
}

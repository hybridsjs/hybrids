import { camelToDash } from '../utils';

export default function resolveStyle(host, target, value, data) {
  if (value === null || typeof value !== 'object') {
    throw TypeError('Style value must be an object instance');
  }

  const previousMap = data.styleMap || new Map();

  data.styleMap = Object.keys(value).reduce((map, key) => {
    const dashKey = camelToDash(key);
    const styleValue = value[key];

    if (!styleValue && styleValue !== 0) {
      target.style.removeProperty(dashKey);
    } else {
      target.style.setProperty(dashKey, styleValue);
    }

    map.set(dashKey, styleValue);
    previousMap.delete(dashKey);

    return map;
  }, new Map());

  previousMap.forEach((styleValue, key) => { target.style[key] = ''; });
}

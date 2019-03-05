import { dataMap, removeTemplate } from '../utils';
// eslint-disable-next-line import/no-cycle
import resolveArray, { arrayMap } from './array';

export default function resolveValue(host, target, value) {
  const type = Array.isArray(value) ? 'array' : typeof value;
  let data = dataMap.get(target, {});

  if (data.type !== type) {
    removeTemplate(target);
    if (type === 'array') arrayMap.delete(target);

    data = dataMap.set(target, { type });

    if (target.textContent !== '') {
      target.textContent = '';
    }
  }

  switch (type) {
    case 'function':
      value(host, target);
      break;
    case 'array':
      resolveArray(host, target, value);
      break;
    default:
      target.textContent = type === 'number' || value ? value : '';
  }
}

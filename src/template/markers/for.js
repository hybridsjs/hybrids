import VirtualFragment from './shared/virtual-fragment';
import State from '../../state';

function createLocals(index, length, key) {
  return {
    index,
    length,
    key,
    number: index + 1,
    first: index === 0,
    last: index === length - 1,
    odd: index % 2 === 0,
    even: index % 2 === 1,
  };
}

export default function ({ node, expr, compile }, localName = 'item') {
  if (process.env.NODE_ENV !== 'production' && !(node instanceof Comment)) {
    throw TypeError('Element must be a <template>');
  }

  const cache = new VirtualFragment(null, node, true).items;
  const state = new State();

  return (list, oldList) => {
    if (process.env.NODE_ENV !== 'production' && typeof list !== 'object') {
      throw TypeError(`'${expr.evaluate}' must be an object: ${typeof list}`);
    }

    const changelog = state.diff(list, oldList);

    if (changelog) {
      const listKeys = Object.keys(list);
      const length = Reflect.has(list, 'length') ? list.length : listKeys.length;

      const deleted = [];

      Object.assign(cache, Object.keys(changelog).reduce((items, key) => {
        const { type, oldKey, newKey, value } = changelog[key];

        if (type === 'delete') {
          if (cache[key]) deleted.push(cache[key]);
          if (!newKey) cache[key] = undefined;
        } else {
          const index = listKeys.indexOf(key);
          const beforeKey = listKeys[index - 1];
          const before = items[beforeKey] || cache[beforeKey];
          let fragment;

          if (oldKey || newKey) {
            fragment = cache[oldKey] || new VirtualFragment(compile(node), node);

            if (oldKey) {
              cache[oldKey] = undefined;
              if (cache[key] && !newKey) deleted.push(cache[key]);
            }
            if (!fragment.isAfter(before)) fragment.insertAfter(before);
          } else if (!cache[key]) {
            fragment = new VirtualFragment(compile(node), node);
            fragment.insertAfter(before);
          } else {
            fragment = cache[key];
          }

          fragment.setLocals({
            [localName]: value,
            [`$${localName}`]: createLocals(index, length, key),
          }, value);

          items[key] = fragment;
        }

        return items;
      }, {}));

      deleted.forEach(fragment => fragment.remove());
      if (Array.isArray(list)) cache.length = list.length;
    }
  };
}

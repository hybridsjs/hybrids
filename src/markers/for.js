import VirtualFragment from './shared/virtual-fragment';

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

export default function ({ node, expr }, localName = 'item') {
  if (process.env.NODE_ENV !== 'production' && !(node instanceof Comment)) {
    throw TypeError('Element must be a <template>');
  }

  const cache = new VirtualFragment(null, node, true).items;

  return (list, { type: globalType, changelog }, compile) => {
    if (process.env.NODE_ENV !== 'production' && typeof list !== 'object') {
      throw TypeError(`'${expr.evaluate}' must be an object: ${typeof list}`);
    }

    const listKeys = Object.keys(list);
    const length = Reflect.has(list, 'length') ? list.length : listKeys.length;

    switch (globalType) {
      case 'modify': {
        const deleted = [];

        Object.assign(cache, Object.keys(changelog).reduce((items, key) => {
          const { type, oldKey, newKey } = changelog[key];

          if (type === 'delete') {
            if (cache[key]) deleted.push(cache[key]);
          } else if (type !== 'modify') {
            const index = listKeys.indexOf(key);
            const beforeKey = listKeys[index - 1];
            const before = items[beforeKey] || cache[beforeKey];
            let fragment;

            if (oldKey || newKey) {
              fragment = cache[oldKey] || new VirtualFragment(compile(node), node);

              if (oldKey) {
                delete cache[oldKey];
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
              [localName]: list[key],
              [`$${localName}`]: createLocals(index, length, key),
            }, list[key]);

            items[key] = fragment;
          }

          return items;
        }, {}));

        deleted.forEach(fragment => fragment.remove());
        if (Array.isArray(list)) cache.length = list.length;

        break;
      }

      default: {
        const cacheKeys = Object.keys(cache);
        const deletedKeys = cacheKeys.filter(key => !{}.hasOwnProperty.call(list, key));
        const deletedFragments = new Set(deletedKeys.map(key => cache[key]));

        let last;

        Object.assign(cache, listKeys.reduce((acc, key, index) => {
          let fragment;

          const keyFromCache = cacheKeys.find(
            cacheKey => cache[cacheKey] && cache[cacheKey].getValue() === list[key],
          ) || ({}.hasOwnProperty.call(cache, key) && key);

          if (keyFromCache) {
            fragment = cache[keyFromCache];
            delete cache[keyFromCache];
            deletedFragments.delete(fragment);

            if (keyFromCache !== key) {
              if (cache[key]) deletedFragments.add(cache[key]);
              if (!fragment.isAfter(last)) fragment.insertAfter(last);
            }
          } else {
            fragment = new VirtualFragment(compile(node), node);
            fragment.insertAfter(last);
          }

          fragment.setLocals({
            [localName]: list[key],
            [`$${localName}`]: createLocals(index, length, key),
          }, list[key]);

          last = fragment;
          acc[key] = fragment;

          return acc;
        }, {}));

        deletedFragments.forEach(fragment => fragment.remove());
        deletedKeys.forEach(key => cache[key] && delete cache[key]);

        if (Array.isArray(list)) cache.length = list.length;
      }
    }
  };
}

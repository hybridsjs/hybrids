import { error } from '@hybrids/debug';
import VirtualFragment from './shared/virtual-fragment';

function createArrayLocals(locals) {
  const { index, length } = locals;
  return Object.assign({
    number: index + 1,
    first: index === 0,
    last: index === length - 1,
    odd: index % 2 === 0,
    even: index % 2 === 1,
  }, locals);
}

export default function foreach(node, expr, localName = 'item') {
  if (!(node instanceof HTMLTemplateElement)) {
    error(TypeError, '[foreach]: <template> element required');
  }

  const cache = new VirtualFragment(null, node, true).items;

  return ({ type: globalType, changelog }, engine) => {
    const list = expr.get();
    if (!(list instanceof Array)) {
      error(TypeError, 'target property path must be an array instance: %s', typeof list);
    }

    switch (globalType) {
      case 'modify': {
        const deleted = [];
        Object.assign(cache, Object.keys(changelog).reduce((items, key) => {
          const { type, oldKey, newKey } = changelog[key];

          if (type === 'delete') {
            if (cache[key]) deleted.push(cache[key]);
          } else {
            const index = Number(key);
            const before = items[index - 1] || cache[index - 1];
            let fragment;

            if (oldKey || newKey) {
              fragment = cache[oldKey] || new VirtualFragment(engine.compile(node), node);

              if (oldKey) {
                cache[oldKey] = null;
                if (cache[key] && !newKey) deleted.push(cache[key]);
              }

              fragment.insertAfter(before);
            } else if (!cache[key]) {
              fragment = new VirtualFragment(engine.compile(node), node);
              fragment.insertAfter(before);
            } else {
              fragment = cache[key];
            }

            fragment.setLocals(createArrayLocals({
              [localName]: list[key], length: list.length, index, key
            }));
            items[key] = fragment;
          }

          return items;
        }, {}));

        deleted.forEach(fragment => fragment.remove());
        cache.length = list.length;

        break;
      }

      default: {
        const itemsLength = cache.length;
        let last;

        Object.keys(list).reduce((acc, key, index) => {
          let fragment;

          if (index < itemsLength) {
            fragment = cache[index];
          } else {
            fragment = new VirtualFragment(engine.compile(node), node);
            fragment.insertAfter(last);
          }

          fragment.setLocals(createArrayLocals({
            [localName]: list[key], index, length: list.length, key
          }));

          last = fragment;
          acc[index] = fragment;

          return acc;
        }, cache);

        for (let i = list.length; i < itemsLength; i += 1) {
          cache[i].remove();
        }

        cache.length = list.length;
      }
    }
  };
}

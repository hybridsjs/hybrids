import { error } from '@hybrids/debug';
import Fragment from './fragment';

export default function foreach(node, expr, localName = 'item') {
  if (!(node instanceof HTMLTemplateElement)) {
    error(TypeError, '[foreach]: <template> element required');
  }

  const pointer = document.createComment('foreach');
  node.parentNode.insertBefore(pointer, node.nextSibling);

  let cache = [];

  return ({ type: globalType, changelog }, engine) => {
    const list = expr.get();
    if (!(list instanceof Array)) {
      error(TypeError, 'target property path must be an array instance: %s', typeof list);
    }

    const length = list.length;

    switch (globalType) {
      case 'modify': {
        Object.assign(cache, Object.keys(changelog).reduce((items, key) => {
          const index = Number(key);
          const { type, oldKey, newKey } = changelog[index];

          if (type === 'delete') {
            if (cache[index]) cache[index].remove();
          } else {
            let fragment;

            if (oldKey || newKey) {
              const next = items[index + 1] || cache[index + 1];
              fragment = cache[oldKey] || new Fragment(engine.compile(node));

              if (oldKey) {
                cache[oldKey] = null;
                if (cache[index] && !newKey) cache[index].remove();
              }

              fragment.insertBefore(pointer, next ? next.getPointer() : undefined);
            } else if (!cache[index]) {
              fragment = new Fragment(engine.compile(node));
              fragment.insertBefore(pointer);
            } else {
              fragment = cache[index];
            }

            fragment.setLocals({ [localName]: list[index], length, index });
            items[index] = fragment;
          }

          return items;
        }, {}));

        cache.length = list.length;

        break;
      }

      default: {
        const itemsLength = cache.length;
        const items = list.map((item, index) => {
          const locals = { [localName]: list[index], index, length };
          let temp;

          if (index < itemsLength) {
            temp = cache[index];
            temp.setLocals(locals);
          } else {
            temp = new Fragment(engine.compile(node), locals);
            temp.insertBefore(pointer);
          }

          return temp;
        });

        for (let i = length; i < itemsLength; i += 1) {
          cache[i].remove();
        }

        cache = items;
      }
    }
  };
}

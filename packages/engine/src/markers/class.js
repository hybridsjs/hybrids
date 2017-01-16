import { error } from '../debug';

export default function classList({ node, expr }, ...classNames) {
  if (!classNames.length) {
    return (list, { type: globalType, oldValue, changelog }) => {
      switch (globalType) {
        case 'modify': {
          const isArray = Array.isArray(list);
          Object.keys(changelog).forEach((key) => {
            switch (changelog[key].type) {
              case 'delete':
                node.classList.remove(isArray ? changelog[key].oldValue : key);
                break;
              default:
                if (isArray) {
                  if (changelog[key].oldValue) node.classList.remove(changelog[key].oldValue);
                  node.classList.add(list[key]);
                } else if (list[key]) {
                  node.classList.add(key);
                } else {
                  node.classList.remove(key);
                }
            }
          });
          break;
        }
        default:
          if (list) {
            if (typeof list !== 'object') {
              error(TypeError, "class: '%evaluate' must be an object: %type", { evaluate: expr.evaluate, type: typeof list });
            }
            const isArray = Array.isArray(list);

            Object.keys(list).forEach((key) => {
              if (isArray) {
                node.classList.add(list[key]);
              } else if (list[key]) {
                node.classList.add(key);
              } else {
                node.classList.remove(key);
              }
            });
          } else if (typeof oldValue === 'object' && oldValue !== null) {
            const isArray = Array.isArray(oldValue);

            Object.keys(oldValue).forEach((key) => {
              if (isArray) {
                node.classList.remove(oldValue[key]);
              } else {
                node.classList.remove(key);
              }
            });
          }
      }
    };
  }

  return (value) => {
    classNames.forEach((name) => {
      if (value) {
        node.classList.add(name);
      } else {
        node.classList.remove(name);
      }
    });
  };
}

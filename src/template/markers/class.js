import State from '../../state';

export default function classList({ node, expr }, ...classNames) {
  if (!classNames.length) {
    const state = new State();

    return (list, oldList) => {
      if (list) {
        if (process.env.NODE_ENV !== 'production' && typeof list !== 'object') {
          throw TypeError(`class: '${expr.evaluate}' must be an object: ${typeof list}`);
        }

        const changelog = state.diff(list, oldList);

        if (changelog) {
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
        }
      } else if (typeof oldList === 'object' && oldList !== null) {
        const isArray = Array.isArray(oldList);

        Object.keys(oldList).forEach((key) => {
          if (isArray) {
            node.classList.remove(oldList[key]);
          } else {
            node.classList.remove(key);
          }
        });
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

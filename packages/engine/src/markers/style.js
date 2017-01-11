import { camelToDash } from '@hybrids/core/src/utils';
import { error } from '../debug';

export default function style({ node, expr }, ...propertyNames) {
  if (!propertyNames.length) {
    return ({ type: globalType, oldValue, changelog }) => {
      const list = expr.get();

      switch (globalType) {
        case 'modify':
          Object.keys(changelog).forEach((key) => {
            switch (changelog[key].type) {
              case 'delete':
                node.style.removeProperty(camelToDash(key));
                break;
              default:
                node.style.setProperty(camelToDash(key), list[key]);
            }
          });
          break;
        default:
          if (list) {
            if (typeof list !== 'object') {
              error(TypeError, "style: '%evaluate' must be an object: %type", { evaluate: expr.evaluate, type: typeof list });
            }
            Object.keys(list).forEach(key => node.style.setProperty(camelToDash(key), list[key]));
          } else if (typeof oldValue === 'object' && oldValue !== null) {
            Object.keys(oldValue).forEach(key => node.style.removeProperty(camelToDash(key)));
          }
      }
    };
  }

  return () => {
    const value = expr.get();
    propertyNames.map(camelToDash).forEach(key => node.style.setProperty(key, value));
  };
}

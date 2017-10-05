import State from '../../state';
import { camelToDash } from '../../utils';

export default function style({ node }, ...propertyNames) {
  if (!propertyNames.length) {
    const state = new State();

    return (list, oldList) => {
      const changelog = state.diff(list, oldList);

      if (changelog) {
        Object.keys(changelog).forEach((key) => {
          switch (changelog[key].type) {
            case 'delete':
              node.style.removeProperty(camelToDash(key));
              break;
            default:
              node.style.setProperty(camelToDash(key), list[key]);
          }
        });
      }
    };
  }

  return (value) => {
    propertyNames.map(camelToDash).forEach((key) => {
      if (!value && value !== 0) {
        node.style.removeProperty(key);
      } else {
        node.style.setProperty(key, value);
      }
    });
  };
}

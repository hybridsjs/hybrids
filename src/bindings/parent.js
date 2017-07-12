import { COMPONENT, OBSERVER } from '../symbols';

export default Component => key => (host, component) => {
  let parentElement;
  const check = ({ target }) => {
    if (target === parentElement) {
      host[OBSERVER].check();
    }
  };

  host.addEventListener('@connect', () => {
    parentElement = host.parentElement;

    while (parentElement) {
      const parentComponent = parentElement[COMPONENT];
      if (parentComponent && parentComponent instanceof Component) {
        component[key] = parentComponent;
        break;
      }
      parentElement = parentElement.parentElement;
    }

    if (parentElement) {
      parentElement.addEventListener('@update', check);
    }
  });

  host.addEventListener('@disconnect', () => {
    if (parentElement) {
      parentElement.removeEventListener('@update', check);
    }
  });
};

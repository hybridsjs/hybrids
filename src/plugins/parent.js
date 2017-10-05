import { COMPONENT } from '../symbols';

export default (Component, { observe = true } = {}) => () => (host, get, set) => {
  let parentElement;
  const check = ({ target }) => {
    if (target === parentElement) {
      set(parentElement);
    }
  };

  host.addEventListener('@connect', () => {
    parentElement = host.parentElement;
    set(null);

    while (parentElement) {
      const parentComponent = parentElement[COMPONENT];
      if (parentComponent && parentComponent instanceof Component) {
        set(parentComponent);
        break;
      }
      parentElement = parentElement.parentElement;
    }

    if (observe && parentElement) {
      parentElement.addEventListener('@change', check);
    }
  });

  host.addEventListener('@disconnect', () => {
    if (parentElement) {
      if (observe) parentElement.removeEventListener('@change', check);

      parentElement = null;
      set(null);
    }
  });
};

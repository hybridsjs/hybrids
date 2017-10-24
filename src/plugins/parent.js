import { COMPONENT } from '../symbols';

export default (Component, { observe = true } = {}) => () => (host, set) => {
  let parentElement;

  const check = ({ target }) => {
    if (target === parentElement) {
      set(parentElement[COMPONENT]);
    }
  };

  host.addEventListener('@connect', () => {
    parentElement = host.parentElement;

    while (parentElement) {
      if (parentElement[COMPONENT] && parentElement[COMPONENT] instanceof Component) {
        set(parentElement[COMPONENT]);

        if (observe) {
          parentElement.addEventListener('@change', check);
        }

        return;
      }
      parentElement = parentElement.parentElement;
    }
  });

  host.addEventListener('@disconnect', () => {
    if (parentElement) {
      if (observe) parentElement.removeEventListener('@change', check);

      parentElement = null;

      set(null);
    }
  });

  return null;
};

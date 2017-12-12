import { COMPONENT } from '../symbols';

export default (Component, { observe = true } = {}) => key => (host, component) => {
  let parentElement;

  const check = ({ target }) => {
    if (target === parentElement) {
      component[key] = parentElement[COMPONENT];
    }
  };

  host.addEventListener('@connect', () => {
    parentElement = host.parentElement;

    while (parentElement) {
      if (parentElement[COMPONENT] && parentElement[COMPONENT] instanceof Component) {
        component[key] = parentElement[COMPONENT];

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
      component[key] = null;
    }
  });

  component[key] = null;
};

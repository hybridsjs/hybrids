import { State, PropertyObserver } from 'papillon';
import { schedule } from '@hybrids/core';

import { error } from './debug';

export default function vdom({ properties, render, autobind = true }, Controller) {
  if (process.env.NODE_ENV !== 'production' && !Reflect.has(Controller.prototype, 'render')) {
    error(TypeError, 'Controller prototype "render" method is required');
  }

  const globalKeys = properties.map(({ property }) => property);
  const protoKeys = new Set();

  if (autobind) {
    let proto = Controller.prototype;
    while (proto) {
      // eslint-disable-next-line no-loop-func
      Reflect.ownKeys(proto).forEach((key) => {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        if (!desc.get && key !== 'render') protoKeys.add(key);
      });
      proto = Object.getPrototypeOf(proto);
      if (proto === Object.prototype) proto = null;
    }
  }

  return (host, ctrl) => {
    const cache = {};
    const keys = new Set([...Object.keys(ctrl), ...globalKeys]);
    const update = schedule.bind(null, () => {
      let needUpdate = false;

      keys.forEach((key) => {
        const value = ctrl[key];

        if (value && typeof value === 'object') {
          const state = new State(value);

          if (state.isChanged() || value !== cache[key] || !{}.hasOwnProperty.call(cache, key)) {
            needUpdate = true;
          }
        } else if (value !== cache[key] || !{}.hasOwnProperty.call(cache, key)) {
          needUpdate = true;
        }

        cache[key] = value;
      });

      if (needUpdate) render(ctrl.render(), host.shadowRoot);
    });

    keys.forEach(key => (new PropertyObserver(ctrl, key).observe(update)));
    protoKeys.forEach(key => (ctrl[key] = ctrl[key].bind(ctrl)));

    schedule(() => {
      host.attachShadow({ mode: 'open' });
      update();
    });
  };
}

import { COMPONENT } from './symbols';
import observe from './observe';
import { defer } from './utils';

export default function bootstrap({ host, Component, template, properties }) {
  const component = new Component();

  Object.defineProperty(host, COMPONENT, { value: component });

  properties.forEach(([key, fn]) => {
    fn(host, () => component[key], (val) => { component[key] = val; });
  });

  let render;
  if (template) {
    render = template.mount(
      host.attachShadow({ mode: 'open' }),
      component,
    );
    render();
  }

  let blockUpdate;
  let raf;
  const update = defer(() => {
    host.dispatchEvent(new CustomEvent('@change', { bubbles: true }));

    if (render && !raf) {
      raf = global.requestAnimationFrame(() => {
        blockUpdate = true;
        render();

        blockUpdate = false;
        raf = undefined;
      });
    }
  });

  if (component.connected) {
    host.addEventListener('@connect', () => component.connected(host));
  }

  if (component.disconnected) {
    host.addEventListener('@disconnect', () => component.disconnected(host));
  }

  if (component.changed) {
    let oldValues = { ...component };

    host.addEventListener('@change', ({ target }) => {
      if (target === host) {
        component.changed(oldValues);
        oldValues = { ...component };
      }
    });
  }

  Object.keys(component).forEach((key) => {
    observe(component, key, () => {
      if (!blockUpdate) update();
    });
  });
}

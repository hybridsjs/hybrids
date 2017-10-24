import observe from './observe';
import { defer } from './utils';

export default function bootstrap({ host, Component, template, plugins }) {
  const component = new Component(host);

  plugins.forEach(([key, plugin]) => {
    component[key] = plugin(host, (val) => { component[key] = val; }, component[key]);
  });

  let render;
  let blockUpdate;

  if (template) {
    let raf;

    render = template.mount(
      host.attachShadow({ mode: 'open' }),
      component,
    );

    render();

    host.addEventListener('@change', ({ target }) => {
      if (target === host && !raf) {
        raf = global.requestAnimationFrame(() => {
          blockUpdate = true;
          render();

          blockUpdate = false;
          raf = undefined;
        });
      }
    });
  }

  if (component.connected) {
    host.addEventListener('@connect', () => component.connected());
  }

  if (component.disconnected) {
    host.addEventListener('@disconnect', () => component.disconnected());
  }

  if (component.changed) {
    let oldValues = { ...component };

    host.addEventListener('@change', ({ target }) => {
      if (target === host) {
        blockUpdate = true;
        component.changed(oldValues);
        oldValues = { ...component };
        blockUpdate = false;
      }
    });
  }

  const update = defer(() => {
    host.dispatchEvent(new CustomEvent('@change', { bubbles: true }));
  });

  Object.keys(component).forEach((key) => {
    observe(component, key, () => {
      if (!blockUpdate) update();
    });
  });

  return component;
}

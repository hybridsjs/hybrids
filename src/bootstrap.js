import observe from './observe';
import { defer } from './utils';

let globalBlock;

export default function bootstrap({ host, Component, template, plugins }) {
  const component = new Component(host);

  plugins.forEach(plugin => plugin(host, component));

  let render;
  let localBlock;

  if (template) {
    let raf;

    render = template.mount(
      host,
      component,
    );

    render();

    host.addEventListener('@change', ({ target }) => {
      if (target === host && !raf) {
        raf = global.requestAnimationFrame(() => {
          globalBlock = true;
          render();
          globalBlock = false;
          raf = undefined;
        });
      }
    });
  }

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
        localBlock = true;

        component.changed(oldValues);
        oldValues = { ...component };

        localBlock = false;
      }
    });
  }

  const update = () => {
    host.dispatchEvent(new CustomEvent('@change', { bubbles: true }));
  };

  Object.keys(component).forEach((key) => {
    if (typeof component[key] !== 'function') {
      observe(component, key, () => {
        if (globalBlock || localBlock) return;
        defer(update);
      });
    }
  });

  return component;
}

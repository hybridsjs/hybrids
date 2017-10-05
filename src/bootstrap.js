import { COMPONENT } from './symbols';
import observe from './observe';
import { defer } from './utils';

export default function bootstrap({ host, Component, template, properties }) {
  const component = new Component();
  Object.defineProperty(host, COMPONENT, { value: component });

  properties.forEach(([key, fn]) => {
    fn(host, () => component[key], (val) => { component[key] = val; });
  });

  if (component.changed) {
    let oldValues = { ...component };
    host.addEventListener('@change', ({ target }) => {
      if (target === host) {
        component.changed(oldValues);
        oldValues = { ...component };
      }
    });
  }

  if (component.connected) {
    host.addEventListener('@connect', () => component.connected(host));
  }

  if (component.disconnected) {
    host.addEventListener('@disconnect', () => component.disconnected(host));
  }

  const render = template && template.mount(
    host.attachShadow({ mode: 'open' }),
    component,
  );

  let rendering;
  let raf;

  const update = () => {
    if (render && !raf) {
      raf = global.requestAnimationFrame(() => {
        rendering = true;

        render();

        rendering = undefined;
        raf = undefined;
      });
    }
  };

  const execute = defer(() => {
    host.dispatchEvent(new CustomEvent('@change', { bubbles: true }));
    update();
  });

  const check = () => {
    if (!rendering) execute();
  };

  Object.keys(component).forEach((key) => {
    observe(component, key, check);
  });

  update();
}

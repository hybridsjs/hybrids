import { Observer } from 'papillon';

import markers from '../markers';
import filters from '../filters';
import Template from './template';

export default (options) => {
  if (process.env.NODE_ENV !== 'production' && !options.template) {
    throw TypeError('"template" option is required');
  }

  const template = new Template(options.template, {
    markers: { ...markers, ...options.markers },
    filters: { ...filters, ...options.filters },
    styles: options.styles,
    name: options.is,
  });

  return (host, component) => {
    const render = Observer.requestAnimationFrame.bind(null, template.mount(
      host.attachShadow({ mode: 'open' }),
      component,
    ));

    host.addEventListener('@connect', render);

    host.addEventListener('@change', ({ target }) => {
      if (host === target) render();
    });
  };
};

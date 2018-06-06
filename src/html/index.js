import { compile } from './template';
import * as methods from './methods';
import resolve from './resolve';

const updates = new Map();

function create(parts, args, isSVG) {
  const update = (host, target = host) => {
    const id = `${isSVG ? 'svg:' : ''}${parts.join('')}`;
    let render = updates.get(id);

    if (!render) {
      render = compile(parts, isSVG);
      updates.set(id, render);
    }

    render(host, target, args);
  };

  return Object.assign(update, methods);
}

export function html(parts, ...args) {
  return create(parts, args);
}

export function svg(parts, ...args) {
  return create(parts, args, true);
}

Object.assign(html, { resolve });
Object.assign(svg, { resolve });

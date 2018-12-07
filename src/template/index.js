import define from '../define';

import { compile, createId } from './core';
import resolve from './resolve';

function defineElements(elements) {
  define(elements);
  return this;
}

function key(id) {
  this.id = id;
  return this;
}

const updates = new Map();

function create(parts, args, isSVG) {
  const update = (host, target = host) => {
    const id = createId(parts, isSVG);
    let render = updates.get(id);

    if (!render) {
      render = compile(parts, isSVG);
      updates.set(id, render);
    }

    render(host, target, args);
  };

  return Object.assign(update, { define: defineElements, key });
}

export function html(parts, ...args) {
  return create(parts, args);
}

export function svg(parts, ...args) {
  return create(parts, args, true);
}

Object.assign(html, { resolve });
Object.assign(svg, { resolve });

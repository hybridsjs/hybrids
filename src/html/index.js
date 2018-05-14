import { compile, createSignature } from './template';
import * as methods from './methods';
import resolve from './resolve';

const templates = new Map();

function create(parts, args, isSVG) {
  let signature = createSignature(parts);
  if (isSVG) signature = `<svg>${signature}</svg>`;

  let render = templates.get(signature);

  if (!render) {
    render = compile(signature, parts, isSVG);
    templates.set(signature, render);
  }

  const fn = (host, target = host) => render(host, target, args);
  return Object.assign(fn, methods);
}

export function html(parts, ...args) {
  return create(parts, args);
}

export function svg(parts, ...args) {
  return create(parts, args, true);
}

Object.assign(html, { resolve });
Object.assign(svg, { resolve });

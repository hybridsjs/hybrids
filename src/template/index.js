import defineElements from '../define';

import { compile, getPlaceholder } from './core';
import * as helpers from './helpers';

const PLACEHOLDER = getPlaceholder();

const templatesMap = new Map();
const stylesMap = new WeakMap();

const methods = {
  define(elements) {
    defineElements(elements);
    return this;
  },
  key(id) {
    this.id = id;
    return this;
  },
  style(...styles) {
    stylesMap.set(this, styles);
    return this;
  },
};

function create(parts, args, isSVG) {
  const fn = (host, target = host) => {
    const styles = stylesMap.get(fn);
    const id = `${parts.join(PLACEHOLDER)}${styles ? styles.join(PLACEHOLDER) : ''}${isSVG ? 'svg' : ''}`;

    let render = templatesMap.get(id);
    if (!render) {
      render = compile(parts, isSVG, styles);
      templatesMap.set(id, render);
    }

    render(host, target, args);
  };

  return Object.assign(fn, methods);
}

export function html(parts, ...args) {
  return create(parts, args);
}

export function svg(parts, ...args) {
  return create(parts, args, true);
}

Object.assign(html, helpers);
Object.assign(svg, helpers);

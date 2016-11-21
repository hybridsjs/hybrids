import { LOCALS } from './symbols';

export const LOCALS_PREFIX = '@';

function resolveLocal(node, name) {
  if (node[LOCALS] && node[LOCALS].has(name)) {
    return { [`${LOCALS_PREFIX}${name}`]: node[LOCALS].get(name) };
  }

  return node.parentElement && resolveLocal(node.parentElement, name);
}

function mergeLocals(node, temp = {}) {
  if (!node[LOCALS]) return temp;

  node[LOCALS].forEach((value, key) => {
    if (!{}.hasOwnProperty.call(temp, key)) {
      temp[`${LOCALS_PREFIX}${key}`] = value;
    }
  });

  if (node.parentElement) {
    return mergeLocals(node.parentElement, temp);
  }

  return temp;
}

export function defineLocals(node, locals) {
  if (!node[LOCALS]) Object.defineProperty(node, LOCALS, { value: new Map() });
  Object.keys(locals).forEach((key) => {
    node[LOCALS].set(key, locals[key]);
  });
}

export function getOwnLocals(node) {
  if (node[LOCALS]) {
    const result = {};
    node[LOCALS].forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  return {};
}

export default class Expression {
  constructor(node, context, path, filters) {
    this.node = node;
    this.path = path;
    this.filters = filters;

    if (this.path.rootProperty[0] === LOCALS_PREFIX) {
      const rootProperty = this.path.rootProperty.substr(1);
      Object.defineProperty(this, 'context', {
        get() { return resolveLocal(this.node, rootProperty) || {}; }
      });

      if (!this.path.isNestedProperty()) this.set = () => {};
    } else {
      this.context = context;
    }
  }

  get evaluate() {
    return this.path.evaluate;
  }

  applyFilters(value) {
    return this.filters.reduce((acc, fn) => fn(acc), value);
  }

  get() {
    return this.applyFilters(this.path.get(this.context));
  }

  set(value, replace) {
    this.path.set(this.context, this.applyFilters(value), replace);
  }

  call(...args) {
    const locals = mergeLocals(this.node);
    return this.applyFilters(this.path.call(this.context, ...args, locals));
  }
}

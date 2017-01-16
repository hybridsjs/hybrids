import { error } from './debug';

export const LOCALS_PREFIX = '$';

const localsMap = new WeakMap();

function resolveLocal(node, name) {
  const locals = localsMap.get(node);
  if (locals && locals.has(name)) {
    return { [`${LOCALS_PREFIX}${name}`]: locals.get(name) };
  }

  if (node.parentElement) {
    return resolveLocal(node.parentElement, name);
  }

  return {};
}

function mergeLocals(node, temp = {}) {
  const locals = localsMap.get(node);
  if (locals) {
    locals.forEach((value, key) => {
      if (!{}.hasOwnProperty.call(temp, key)) {
        temp[key] = value;
      }
    });
  }

  if (node.parentElement) {
    return mergeLocals(node.parentElement, temp);
  }

  return temp;
}

export function defineLocals(node, locals) {
  let map = localsMap.get(node);
  if (!map) {
    map = new Map();
    localsMap.set(node, map);
  }
  Object.keys(locals).forEach((key) => {
    map.set(key, locals[key]);
  });
}

export function getOwnLocals(node) {
  const locals = localsMap.get(node);
  if (locals) {
    const result = {};
    locals.forEach((value, key) => (result[key] = value));
    return result;
  }

  return {};
}

export default class Expression {
  constructor(node, context, path, filters = []) {
    this.node = node;
    this.path = path;
    this.filters = filters;

    if (this.path.rootProperty[0] === LOCALS_PREFIX) {
      const rootProperty = this.path.rootProperty.substr(1);
      Object.defineProperty(this, 'context', {
        get: () => resolveLocal(this.node, rootProperty)
      });

      if (!this.path.isNestedProperty()) {
        this.set = () => {
          error(TypeError, "expression: Local variable '%local' is readonly", { local: rootProperty });
        };
      }
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
    if (!Reflect.has(this.context, this.path.rootProperty)) {
      const text = `expression: ${this.path.isNestedProperty() ? "'%property' in '%evaluate'" : "'%property' "} must be defined`;
      error(ReferenceError, text, {
        property: this.path.rootProperty, evaluate: this.path.evaluate
      });
    }

    if (this.path.computed) return this.call();
    return this.applyFilters(this.path.get(this.context));
  }

  set(value, replace) {
    if (this.path.computed) {
      error(TypeError, "expression: computed path '%evaluate' is readonly", { evaluate: this.path.evaluate });
    }

    if (!Reflect.has(this.context, this.path.rootProperty)) {
      const text = `expression: ${this.path.isNestedProperty() ? "'%property' in '%evaluate'" : "'%property' "} must be defined`;
      error(ReferenceError, text, {
        property: this.path.rootProperty, evaluate: this.path.evaluate
      });
    }

    this.path.set(this.context, this.applyFilters(value), replace);
  }

  call(argsMap) {
    const locals = mergeLocals(this.node, argsMap);
    return this.applyFilters(this.path.call(this.context, locals));
  }
}

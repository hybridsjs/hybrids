export const CONTEXT = Symbol('context');

function resolve(node, name) {
  const context = node[CONTEXT];
  if (context && Reflect.has(context, name)) {
    return context;
  }

  const parent = node.parentElement || node.parentNode;
  if (parent) {
    return resolve(parent, name);
  }

  return {};
}

function merge(node, temp = {}) {
  const context = node[CONTEXT];
  if (context) {
    Object.entries(context).forEach(([key, value]) => {
      if (!{}.hasOwnProperty.call(temp, key)) {
        temp[key] = value;
      }
    });
  }

  if (node.parentElement) {
    return merge(node.parentElement, temp);
  }

  return temp;
}

function applyFilters(value, filters = []) {
  return filters.reduce((acc, fn) => fn(acc), value);
}

export function setNodeContext(node, context) {
  Object.defineProperty(node, CONTEXT, { value: context, configurable: true });
}

export function getNodeContext(node) {
  return node[CONTEXT];
}

export default class Expression {
  constructor(node, path, filters) {
    this.node = node;
    this.path = path;
    this.filters = filters;
  }

  get evaluate() {
    return this.path.evaluate;
  }

  get() {
    return applyFilters(
      this.path.get(resolve(this.node, this.path.rootProperty)), this.filters,
    );
  }

  set(value, replace) {
    this.path.set(
      resolve(this.node, this.path.rootProperty),
      applyFilters(value, this.filters),
      replace,
    );
  }

  call(...args) {
    return applyFilters(
      this.path.call(
        resolve(this.node, this.path.rootProperty),
        merge(this.node),
        ...args,
      ),
      this.filters,
    );
  }
}

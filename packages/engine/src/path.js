import { error } from '@hybrids/debug';

function parse(evaluate) {
  const result = [];

  const property = evaluate.split('').reduce(
    (acc, char) => {
      switch (char) {
        case '.':
          result.push({ property: acc, proto: {} });
          return '';
        case '[':
          result.push({ property: acc, proto: [] });
          return '';
        case ']':
          return acc;
        default:
          return acc + char;
      }
    }, '');

  result.push({ property });

  return result;
}

export default class Path {
  constructor(evaluate) {
    this.evaluate = evaluate;
    this.path = parse(evaluate);

    return this;
  }

  get rootProperty() {
    return this.path[0].property;
  }

  isNestedProperty() {
    return !!this.path.length;
  }

  get(context) {
    if (!Reflect.has(context, this.rootProperty)) {
      error(
        ReferenceError, "'%s': root property must be defined: %s", this.evaluate, this.rootProperty,
      );
    }

    let result = context;

    this.path.every(({ property, proto }) => {
      result = result[property];

      if (result && proto && !(result instanceof Object)) {
        error(
          TypeError, "'%s': '%s' must be an object: %s", this.evaluate, property, typeof result,
        );
      }

      return result;
    });

    return result;
  }

  set(context, value, replace) {
    if (!Reflect.has(context, this.rootProperty)) {
      error(ReferenceError, "'%s' is not defined", this.rootProperty);
    }

    const result = this.path.reduce((acc, { property, proto }) => {
      if (proto) {
        if (!acc.context[property]) {
          acc.context[property] = proto.constructor();
        } else if (!(acc.context[property] instanceof Object)) {
          error(
            TypeError,
            "'%s': '%s' must be an object: %s",
            this.evaluate,
            property,
            typeof acc.context[property],
          );
        }

        acc.context = acc.context[property];
      } else {
        acc.property = property;
      }

      return acc;
    }, { context });

    if (replace || result.context[result.property] === undefined) {
      result.context[result.property] = value;
    }

    return result.context[result.property];
  }

  call(context, ...args) {
    const result = this.path.reduce((acc, { property, proto }) => {
      if (proto) {
        acc.context = acc.context[property];
        if (!(acc.context instanceof Object)) {
          error(
            TypeError,
            "'%s': '%s' must be an object: %s",
            this.evaluate,
            property,
            typeof acc.context,
          );
        }
      } else {
        acc.property = property;
      }

      return acc;
    }, { context });

    const type = typeof result.context[result.property];

    if (type !== 'function') {
      error(TypeError, "'%s': path target must be a function: %s", this.evaluate, type);
    }

    return result.context[result.property](...args);
  }

  delete(context) {
    let result = { context, property: this.path[0].property };

    this.path.some(({ property }) => {
      if (!{}.hasOwnProperty.call(context, property)) {
        return true;
      }

      if (Object.keys(context).length > 1) {
        result = { context, property };
      }

      context = context[property];

      return false;
    });

    delete result.context[result.property];
  }

  toJSON() {
    return this.path;
  }
}

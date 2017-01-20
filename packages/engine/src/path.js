import { error } from './debug';

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
  constructor(input) {
    if (!input) error(TypeError, 'path: Path cannot be empty');

    if (typeof input === 'object') {
      Object.assign(this, input);
    } else {
      this.evaluate = input;
      if (input.substr(-2) === '()') {
        input = input.substr(0, input.length - 2);
        this.isComputed = true;
      } else {
        this.isComputed = false;
      }
      this.path = parse(input);
    }
  }

  get rootProperty() {
    return this.path[0].property;
  }

  get isNestedProperty() {
    return this.path.length > 1;
  }

  get(context) {
    let result = context;

    this.path.every(({ property, proto }) => {
      result = result[property];

      if (result && proto && !(result instanceof Object)) {
        error(TypeError, `path: ${this.isNestedProperty ? "'%property' in '%evaluate'" : "'%evaluate'"} must be an object: %type`, {
          evaluate: this.evaluate, property, type: typeof result,
        });
      }

      return result;
    });

    return result;
  }

  set(context, value, replace = true) {
    const result = this.path.reduce((acc, { property, proto }) => {
      if (proto) {
        if (!acc.context[property]) {
          acc.context[property] = proto.constructor();
        } else if (!(acc.context[property] instanceof Object)) {
          error(TypeError, `path: ${this.isNestedProperty ? "'%property' in '%evaluate'" : "'%evaluate'"} must be an object: %type`, {
            evaluate: this.evaluate, property, type: typeof acc.context[property],
          });
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
          error(TypeError, `path: ${this.isNestedProperty ? "'%property' in '%evaluate'" : "'%evaluate'"} must be an object: %type`, {
            evaluate: this.evaluate, property, type: typeof acc.context,
          });
        }
      } else {
        acc.property = property;
      }

      return acc;
    }, { context });

    const type = typeof result.context[result.property];

    if (type !== 'function') {
      error(TypeError, `path: ${this.isNestedProperty ? "'%property' in '%evaluate'" : "'%evaluate'"} must be a function: %type`, {
        evaluate: this.evaluate, property: result.property, type,
      });
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
}

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
    if (!input) throw TypeError('Path cannot be empty');

    if (typeof input === 'object') {
      Object.assign(this, input);
    } else {
      this.evaluate = input;
      this.path = parse(input);
    }
  }

  get rootProperty() {
    return this.path[0].property;
  }

  get(context) {
    let result = context;

    this.path.every(({ property, proto }) => {
      result = result[property];

      if (result && proto && !(result instanceof Object)) {
        throw TypeError(`'${this.evaluate}' must be an object: ${typeof result}`);
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
          throw TypeError(`'${this.evaluate}' must be an object: ${typeof acc.context[property]}`);
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
          throw TypeError(`'${this.evaluate}' must be an object: ${typeof acc.context}`);
        }
      } else {
        acc.property = property;
      }

      return acc;
    }, { context });

    const type = typeof result.context[result.property];

    if (type !== 'function') {
      throw TypeError(`'${this.evaluate}' must be a function: ${type}`);
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

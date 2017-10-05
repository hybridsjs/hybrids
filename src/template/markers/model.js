import Path from '../path';

function bindRadio(node, expr, path) {
  return {
    up() { expr.set(path.get(node)); },
    down() { node.checked = expr.get() === path.get(node); },
  };
}

function bindCheckbox(node, expr, path) {
  return {
    up() {
      let target = expr.get();
      const value = path.get(node);
      if (node.hasAttribute('value')) {
        if (!target || !Array.isArray(target)) {
          target = [];
          expr.set(target);
        }
        if (node.checked) {
          if (target.indexOf(value) === -1) target.push(value);
        } else {
          const index = target.indexOf(value);
          if (index > -1) target.splice(index, 1);
        }
      } else {
        expr.set(node.checked);
      }
    },
    down(value) {
      if (node.hasAttribute('value')) {
        if (value) {
          if (process.env.NODE_ENV !== 'production' && !Array.isArray(value)) {
            throw TypeError(`'${expr.evaluate}' must be an array: ${typeof value}`);
          }
          node.checked = value.indexOf(path.get(node)) > -1;
        } else {
          node.checked = false;
        }
      } else {
        node.checked = !!value;
      }
    },
  };
}

function bindSelect(node, expr, path, multiply = false) {
  return {
    up() {
      let value = expr.get();
      const options = Array.from(node.options)
        .filter(o => o.selected)
        .map(o => path.get(o));

      if (multiply) {
        if (!Array.isArray(value)) {
          value = [];
          expr.set(value);
        }
        Object.assign(value, options);
        value.length = options.length;
      } else {
        expr.set(options[0]);
      }
    },
    down(value) {
      if (multiply) {
        if (value === undefined) {
          value = [];
        } else if (process.env.NODE_ENV !== 'production' && !Array.isArray(value)) {
          throw Error("model: '%evaluate' must be an array: %type", {
            evaluate: expr.evaluate, type: typeof value,
          });
        }
      } else {
        value = [value];
      }

      Array.from(node.options).forEach((o) => {
        const optionValue = path.get(o);
        o.selected = value.indexOf(optionValue) > -1;
      });
    },
  };
}

function bindDefault(node, expr, path) {
  return {
    up() { expr.set(path.get(node)); },
    down(value) {
      if (value !== undefined) path.set(node, value);
    },
  };
}

export default function model({ node, expr }, sourcePath = 'value', eventName) {
  const path = new Path(sourcePath);
  let callbacks;
  let flag = false;

  switch (node.type) {
    case 'radio':
      callbacks = bindRadio(node, expr, path);
      break;
    case 'checkbox':
      callbacks = bindCheckbox(node, expr, path);
      break;
    case 'select-one':
      callbacks = bindSelect(node, expr, path);
      break;
    case 'select-multiple':
      callbacks = bindSelect(node, expr, path, true);
      break;
    default:
      if (node.nodeName === 'INPUT') eventName = eventName || 'input';
      callbacks = bindDefault(node, expr, path);
  }

  node.addEventListener(eventName || 'change', () => {
    flag = true;
    global.requestAnimationFrame(() => {
      callbacks.up();
      flag = false;
    });
  });

  return (value) => {
    if (!flag) callbacks.down(value);
  };
}

import { error } from '@hybrids/debug';
import Path from '../path';

function bindRadio(node, expr, path) {
  node.addEventListener('change', () => {
    expr.set(node.checked ? path.get(node) : undefined);
  });
  return () => {
    node.checked = expr.get();
  };
}

function bindCheckbox(node, expr, path) {
  node.addEventListener('change', () => {
    let target = expr.get();
    const value = path.get(node);
    const isArray = Array.isArray(target);
    if ((target !== undefined && target !== value)) {
      if (!isArray) {
        target = [target];
        expr.set(target);
      }
      if (node.checked) {
        if (target.indexOf(value) === -1) target.push(value);
      } else {
        const index = target.indexOf(value);
        if (index > -1) target.splice(index, 1);
      }
    } else if (value !== undefined) {
      expr.set(node.checked ? value : undefined);
    } else {
      expr.set(node.checked);
    }
  });

  return () => {
    const value = expr.get();

    if (Array.isArray(value)) {
      node.checked = value.indexOf(path.get(node)) > -1;
    } else {
      node.checked = value === path.get(node);
    }
  };
}

function bindSelect(node, expr, path, multiply = false) {
  node.addEventListener('change', () => {
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
  });

  return () => {
    let value = expr.get();
    if (value !== undefined && !Array.isArray(value)) {
      if (multiply) {
        error(TypeError, "bind: target property '%s' must be an array: %s", expr.evaluate, typeof value);
      }
      node.value = value;
      value = [value];
    } else {
      value = [];
    }

    Array.from(node.options).forEach((o) => {
      const optionValue = path.get(o);
      if (value.indexOf(optionValue) > -1) {
        o.selected = true;
      }
    });
  };
}

function bindDefault(node, expr, path) {
  node.addEventListener('input', () => {
    expr.set(node.checked ? path.get(node) : undefined);
  });
  return () => {
    const value = expr.get();
    path.set(node, value !== undefined ? value : '');
  };
}

export default function bind(node, expr, sourcePath = 'value') {
  const path = new Path(sourcePath);

  switch (node.type) {
    case 'radio':
      return bindRadio(node, expr, path);
    case 'checkbox':
      return bindCheckbox(node, expr, path);
    case 'select-one':
      return bindSelect(node, expr, path);
    case 'select-multiple':
      return bindSelect(node, expr, path, true);
    default:
      return bindDefault(node, expr, path);
  }
}

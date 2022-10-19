import global from "./global.js";

const fns = new WeakMap();
const queue = new Set();

function execute() {
  const errors = [];

  for (const target of queue) {
    try {
      fns.get(target)();
    } catch (e) {
      errors.push(e);
    }
  }

  queue.clear();

  if (errors.length > 1) throw errors;
  if (errors.length) throw errors[0];
}

export function dispatch(target) {
  if (fns.has(target)) {
    if (!queue.size) {
      global.requestAnimationFrame(execute);
    }
    queue.add(target);
  }
}

export function subscribe(target, cb) {
  fns.set(target, cb);
  dispatch(target);

  return () => {
    queue.delete(target);
    fns.delete(target);
  };
}

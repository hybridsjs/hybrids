import global from "./global.js";

const fns = new WeakMap();
const queue = new Set();

function execute() {
  const errors = [];

  for (const fn of queue) {
    try {
      fn();
    } catch (e) {
      errors.push(e);
    }
  }

  queue.clear();

  if (errors.length > 1) throw errors;
  if (errors.length) throw errors[0];
}

export function dispatch(target) {
  if (!queue.size) {
    global.requestAnimationFrame(execute);
  }
  queue.add(fns.get(target));
}

export function subscribe(target, cb) {
  fns.set(target, cb);
  dispatch(target);
}

export function unsubscribe(target) {
  fns.delete(target);
}

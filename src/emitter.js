const targets = new WeakMap();

function getListeners(target) {
  let listeners = targets.get(target);
  if (!listeners) {
    listeners = new Set();
    targets.set(target, listeners);
  }
  return listeners;
}

const queue = new Set();
const run = fn => fn();

function execute() {
  try {
    queue.forEach((target) => {
      try {
        getListeners(target).forEach(run);
        queue.delete(target);
      } catch (e) {
        queue.delete(target);
        throw e;
      }
    });
  } catch (e) {
    if (queue.size) execute();
    throw e;
  }
}

export function dispatch(target) {
  if (!queue.size) {
    requestAnimationFrame(execute);
  }
  queue.add(target);
}

export function subscribe(target, cb) {
  const listeners = getListeners(target);
  listeners.add(cb);
  dispatch(target);

  return () => listeners.delete(cb);
}

const callbacks = new WeakMap();
const queue = new Set();

function execute() {
  try {
    queue.forEach(target => {
      try {
        callbacks.get(target)();
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
  if (callbacks.has(target)) {
    if (!queue.size) {
      requestAnimationFrame(execute);
    }
    queue.add(target);
  }
}

export function subscribe(target, cb) {
  callbacks.set(target, cb);
  dispatch(target);

  return function unsubscribe() {
    queue.delete(target);
    callbacks.delete(target);
  };
}

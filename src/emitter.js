import { deferred } from "./utils.js";

let queue = new Set();
export function add(fn) {
  if (queue.size === 0) {
    queue = new Set();
    deferred.then(execute);
  }

  queue.add(fn);
}

export function clear(fn) {
  queue.delete(fn);
}

function execute() {
  for (const fn of queue) {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  }

  queue.clear();
}

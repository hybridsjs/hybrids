import { deferred } from "./utils.js";

const queue = new Set();
export function add(fn) {
  if (!queue.size) deferred.then(execute);
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

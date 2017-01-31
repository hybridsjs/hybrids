let request;
let callbacks;

export default function schedule(cb) {
  if (!request) {
    callbacks = new Set().add(cb);
    request = global.requestAnimationFrame(() => {
      callbacks.forEach(c => c());
      request = callbacks = undefined;
    });
  } else {
    callbacks.add(cb);
  }

  return cb;
}

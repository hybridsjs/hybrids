import { createMap } from '../utils';

const map = createMap();

export default function resolve(promise, placeholder, delay = 200) {
  return (host, target) => {
    let timeout;

    if (placeholder) {
      timeout = setTimeout(() => {
        timeout = undefined;

        requestAnimationFrame(() => {
          placeholder(host, target);
        });
      }, delay);
    }

    map.set(target, promise);
    promise.then((template) => {
      if (timeout) clearTimeout(timeout);

      if (map.get(target) === promise) {
        template(host, target);
        map.set(target, null);
      }
    });
  };
}

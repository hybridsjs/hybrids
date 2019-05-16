import { deferred, shadyCSS } from './utils';

const map = new WeakMap();
const cache = new WeakMap();

let queue = [];
let index = 0;
let startTime = 0;

const FPS_THRESHOLD = 1000 / 60; // 60 FPS ~ 16,67ms time window

export function update() {
  try {
    let offset = 1;

    startTime = performance.now();

    for (; index < queue.length; index += 1) {
      const target = queue[index];

      if (map.has(target)) {
        const key = map.get(target);
        const prevUpdate = cache.get(target);
        const nextUpdate = target[key];

        if (nextUpdate !== prevUpdate) {
          cache.set(target, nextUpdate);
          nextUpdate();
          if (!prevUpdate) {
            shadyCSS(shady => shady.styleElement(target));
          } else {
            shadyCSS(shady => shady.styleSubtree(target));
          }
        }

        if (index % offset === 0) {
          if (index + 1 < queue.length && (performance.now() - startTime) > FPS_THRESHOLD) {
            throw queue;
          } else {
            offset *= 2;
          }
        }
      }
    }

    queue = [];
    index = 0;
    deferred.then(() => { startTime = 0; });
  } catch (e) {
    index += 1;
    requestAnimationFrame(update);
    deferred.then(() => { startTime = 0; });

    if (e !== queue) throw e;
  }
}

function addToQueue(event) {
  if (event.target === event.currentTarget && map.has(event.target)) {
    if (!startTime) {
      if (!queue.length) {
        requestAnimationFrame(update);
      } else {
        queue.splice(index, 0, event.target);
        return;
      }
    } else if (!queue.length) {
      if ((performance.now() - startTime) > FPS_THRESHOLD) {
        requestAnimationFrame(update);
      } else {
        deferred.then(update);
      }
    }

    queue.push(event.target);
  }
}

export default function render(get, customOptions = {}) {
  if (typeof get !== 'function') {
    throw TypeError(`The first argument must be a function: ${typeof get}`);
  }

  const options = { shadowRoot: true, ...customOptions };

  return {
    get: (host) => {
      const fn = get(host);
      return () => fn(host, options.shadowRoot ? host.shadowRoot : host);
    },
    connect(host, key) {
      if (map.has(host)) {
        throw Error(`Render factory already used in '${map.get(host)}' key`);
      }

      if (options.shadowRoot && !host.shadowRoot) {
        const shadowRootInit = { mode: 'open' };
        if (typeof options.shadowRoot === 'object') {
          Object.assign(shadowRootInit, options.shadowRoot);
        }
        host.attachShadow(shadowRootInit);
      }

      host.addEventListener('@invalidate', addToQueue);
      map.set(host, key);

      return () => {
        host.removeEventListener('@invalidate', addToQueue);
        map.delete(host);
      };
    },
  };
}

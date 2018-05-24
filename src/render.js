import { shadyCSS } from './utils';

const map = new WeakMap();
const cache = new WeakMap();
const FPS_THRESHOLD = 1000 / 60; // 60 FPS ~ 16,67ms time window
let queue = [];

export function update(index = 0, startTime = 0) {
  if (startTime && (performance.now() - startTime > FPS_THRESHOLD)) {
    requestAnimationFrame(() => update(index));
  } else {
    const target = queue[index];
    const nextTime = performance.now();
    const next = () => update(index + 1, nextTime);

    if (!target) {
      shadyCSS(shady => queue.forEach(t => shady.styleSubtree(t)));
      queue = [];
    } else if (map.has(target)) {
      const key = map.get(target);
      const prevUpdate = cache.get(target);
      let nextUpdate;

      try {
        nextUpdate = target[key];

        if (nextUpdate !== prevUpdate) {
          cache.set(target, nextUpdate);
          return Promise.resolve().then(() => {
            try {
              nextUpdate();
              if (!prevUpdate) shadyCSS(shady => shady.styleElement(target));
              next();
            } catch (e) {
              next();
              throw e;
            }
          });
        }
        next();
      } catch (e) {
        next();
        throw e;
      }
    } else {
      next();
    }
  }
  return null;
}

export default function render(get) {
  if (typeof get !== 'function') {
    throw TypeError(`[render] The first argument must be a function: ${typeof get}`);
  }

  return {
    get: (host) => {
      const fn = get(host);
      return () => fn(host, host.shadowRoot);
    },
    connect(host, key) {
      if (map.has(host)) {
        throw Error(`[render] Render factory already used in '${map.get(host)}' key`);
      }

      if (!host.shadowRoot) {
        host.attachShadow({ mode: 'open' });
        host.addEventListener('@invalidate', ({ target }) => {
          if (host === target && map.has(target)) {
            if (!queue[0]) {
              requestAnimationFrame((() => update()));
            }
            if (queue.indexOf(target) === -1) {
              queue.push(target);
            }
          }
        });
      }

      map.set(host, key);

      return () => map.delete(host);
    },
  };
}

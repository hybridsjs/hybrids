const map = new WeakMap();

const FPS_THRESHOLD = 1000 / 60; // 60 FPS ~ 16,67ms time window

const queue = new Set();
const cache = new WeakMap();

function update(iterator, startTime) {
  if (startTime && (performance.now() - startTime > FPS_THRESHOLD)) {
    requestAnimationFrame(() => update(iterator));
  } else {
    const { done, value: target } = iterator.next();
    const nextTime = performance.now();

    if (done) {
      queue.clear();
    } else if (map.has(target)) {
      const key = map.get(target);
      const prevFn = cache.get(target);
      const nextFn = target[key];

      if (nextFn !== prevFn) {
        cache.set(target, nextFn);

        Promise.resolve().then(() => {
          nextFn();
          update(iterator, nextTime);
        });
      } else {
        update(iterator, nextTime);
      }
    } else {
      update(iterator, nextTime);
    }
  }
}

document.addEventListener('@invalidate', (event) => {
  const target = event.composedPath()[0];

  if (map.has(target)) {
    if (!queue.size) {
      requestAnimationFrame(() => update(queue.values()));
    }
    queue.add(target);
  }
});

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
      if (!host.shadowRoot) {
        host.attachShadow({ mode: 'open' });
      }

      map.set(host, key);

      return () => map.delete(host);
    },
  };
}

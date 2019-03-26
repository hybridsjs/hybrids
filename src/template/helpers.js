const setCache = new Map();
export function set(propertyName, value) {
  if (!propertyName) throw Error(`Target property name missing: ${propertyName}`);

  if (arguments.length === 2) {
    return (host) => { host[propertyName] = value; };
  }

  let fn = setCache.get(propertyName);

  if (!fn) {
    fn = (host, { target }) => { host[propertyName] = target.value; };
    setCache.set(propertyName, fn);
  }

  return fn;
}

const promiseMap = new WeakMap();
export function resolve(promise, placeholder, delay = 200) {
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

    promiseMap.set(target, promise);

    promise.then((template) => {
      if (timeout) clearTimeout(timeout);

      if (promiseMap.get(target) === promise) {
        template(host, target);
        promiseMap.set(target, null);
      }
    });
  };
}

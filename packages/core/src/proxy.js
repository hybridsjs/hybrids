import { error } from './debug';

let activeContext = null;

export function injectable(fn) {
  return function wrapper(...args) {
    if (!activeContext) error(ReferenceError, "proxy: Illegal invocation of '%fn'", { fn: fn.name });
    return fn(activeContext, ...args);
  };
}

export function callWithContext(context, fn) {
  const oldContext = activeContext;
  activeContext = context;

  const result = fn();

  activeContext = oldContext;
  return result;
}

export function resolve(fn) {
  if (!activeContext) error(ReferenceError, "proxy: Illegal invocation of '%fn'", { fn: fn.name });
  const context = activeContext;
  return () => callWithContext(context, fn);
}

const map = new WeakMap();
const set = new WeakSet();

export function mapInstance(target, context) {
  map.set(target, context);
}

export function proxy(Controller) {
  let proto = Controller.prototype;

  while (proto) {
    if (!set.has(proto)) {
      set.add(proto);

      Object.getOwnPropertyNames(proto).forEach((key) => { // eslint-disable-line no-loop-func
        if (key !== 'constructor') {
          const desc = Object.getOwnPropertyDescriptor(proto, key);

          if (desc.value && typeof desc.value === 'function') {
            const fn = desc.value;
            const temp = {
              [key](...args) {
                return callWithContext(map.get(this), fn.bind(this, ...args));
              },
            };
            desc.value = temp[key];
            Object.defineProperty(proto, key, desc);
          } else if (desc.get) {
            const oldGet = desc.get;
            const oldSet = desc.set;

            desc.get = function proxyGet() {
              return callWithContext(map.get(this), () => oldGet.call(this));
            };

            if (desc.set) {
              desc.set = function proxySet(val) {
                return callWithContext(map.get(this), () => oldSet.call(this, val));
              };
            }

            Object.defineProperty(proto, key, desc);
          }
        }
      });
    }
    proto = Object.getPrototypeOf(proto);
    if (proto === Object.prototype) proto = null;
  }
}

import { error } from '@hybrids/debug';

let activeContext = null;

export function injectable(fn) {
  function wrapper(...args) {
    if (!activeContext) {
      error('illegal invocation: %s', fn.name);
    }
    return fn.apply(activeContext, args);
  }

  Object.defineProperty(wrapper, 'source', { value: fn });

  return wrapper;
}

export function callWithContext(context, fn) {
  const oldContext = activeContext;
  activeContext = context;
  const result = fn();
  activeContext = oldContext;

  return result;
}

export function resolve(fn, context = activeContext) {
  if (!context) {
    error('illegal invocation: %s', fn.name);
  }

  return () => callWithContext(context, fn);
}

const map = new WeakMap();
const set = new WeakSet();

export function proxy(element, constructor) {
  const controller = callWithContext(element, () => constructor());

  if (typeof Proxy === 'function') {
    return new Proxy(controller, {
      get(target, property, receiver) {
        const value = callWithContext(element, () => Reflect.get(target, property, receiver));

        if (typeof value === 'function') {
          return (...args) => callWithContext(element, value.bind(receiver, ...args));
        }

        return value;
      },
      set(target, property, value, receiver) {
        return callWithContext(element, () => Reflect.set(target, property, value, receiver));
      }
    });
  }

  map.set(controller, element);

  let proto = Object.getPrototypeOf(controller);
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
                return callWithContext(map.get(this), () => fn.apply(this, args));
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

  return controller;
}

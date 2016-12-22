import { error } from '@hybrids/debug';

const CONTEXT_NAME = '__hybrids_context__';

if (!{}.hasOwnProperty.call(window, CONTEXT_NAME)) {
  Object.defineProperty(window, CONTEXT_NAME, { writable: true });
}

export function injectable(fn) {
  function wrapper(...args) {
    if (!window[CONTEXT_NAME]) {
      error('illegal invocation: %s', fn.name);
    }
    return fn.apply(window[CONTEXT_NAME], args);
  }

  Object.defineProperty(wrapper, 'source', { value: fn });

  return wrapper;
}

export function callWithContext(currentContext, fn) {
  const oldContext = window[CONTEXT_NAME];
  window[CONTEXT_NAME] = currentContext;
  const result = fn();
  window[CONTEXT_NAME] = oldContext;

  return result;
}

export function resolve(fn, currentContext = window[CONTEXT_NAME]) {
  if (!currentContext) {
    error('illegal invocation: %s', fn.name);
  }

  return () => callWithContext(currentContext, fn);
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

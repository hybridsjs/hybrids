import * as emitter from "./emitter.js";

const entries = new WeakMap();
const stack = new Set();

function dispatch(entry) {
  const contexts = [];
  let index = 0;

  while (entry) {
    entry.resolved = false;

    if (entry.contexts) {
      for (const context of entry.contexts) {
        if (!stack.has(context) && !contexts.includes(context)) {
          contexts.push(context);
        }
      }
    }

    if (entry.observe) {
      emitter.add(entry.observe);
    }

    entry = contexts[index++];
  }
}

export function getEntry(target, key) {
  let map = entries.get(target);
  if (!map) {
    map = new Map();
    entries.set(target, map);
  }

  let entry = map.get(key);
  if (!entry) {
    entry = {
      key,
      target,
      value: undefined,
      lastValue: undefined,
      resolved: false,
      contexts: undefined,
      deps: undefined,
      observe: undefined,
    };
    map.set(key, entry);
  }

  return entry;
}

export function getEntries(target) {
  const targetMap = entries.get(target);
  if (targetMap) return [...targetMap.values()];
  return [];
}

let context = null;
export function get(target, key, getter) {
  const entry = getEntry(target, key);

  if (context) {
    if (!entry.contexts) entry.contexts = new Set();
    if (!context.deps) context.deps = new Set();

    entry.contexts.add(context);
    context.deps.add(entry);
  }

  if (entry.resolved) return entry.value;

  if (entry.deps) {
    for (const depEntry of entry.deps) {
      depEntry.contexts.delete(entry);
    }
    entry.deps.clear();
  }

  const lastContext = context;

  try {
    if (stack.has(entry)) {
      throw Error(`Circular get invocation is forbidden: '${key}'`);
    }

    context = entry;
    stack.add(entry);

    entry.value = getter(target, entry.value);
    entry.resolved = true;

    context = lastContext;

    stack.delete(entry);
  } catch (e) {
    context = lastContext;
    stack.delete(entry);

    if (context) {
      context.deps.delete(entry);
      entry.contexts.delete(context);
    }

    throw e;
  }

  return entry.value;
}

export function set(target, key, setter, value) {
  const entry = getEntry(target, key);
  const newValue = setter(target, value, entry.value);

  if (newValue !== entry.value) {
    entry.value = newValue;
    dispatch(entry);
  }
}

export function observe(target, key, getter, fn) {
  const entry = getEntry(target, key);

  entry.observe = () => {
    const value = get(target, key, getter);

    if (value !== entry.lastValue) {
      fn(target, value, entry.lastValue);
      entry.lastValue = value;
    }
  };

  try {
    entry.observe();
  } catch (e) {
    console.error(e);
  }

  return () => {
    entry.observe = undefined;
    entry.lastValue = undefined;
  };
}

const gc = new Set();
function deleteEntry(entry) {
  if (!gc.size) {
    setTimeout(() => {
      for (const e of gc) {
        if (!e.contexts || e.contexts.size === 0) {
          const targetMap = entries.get(e.target);
          targetMap.delete(e.key);
        }
      }

      gc.clear();
    });
  }

  gc.add(entry);
}

function invalidateEntry(entry, options) {
  dispatch(entry);

  if (options.clearValue) {
    entry.value = undefined;
    entry.lastValue = undefined;
  }

  if (options.deleteEntry) {
    if (entry.deps) {
      for (const depEntry of entry.deps) {
        depEntry.contexts.delete(entry);
      }
      entry.deps = undefined;
    }

    if (entry.contexts) {
      for (const context of entry.contexts) {
        context.deps.delete(entry);
      }
      entry.contexts = undefined;
    }

    deleteEntry(entry);
  }
}

export function invalidate(target, key, options = {}) {
  const entry = getEntry(target, key);
  invalidateEntry(entry, options);
}

export function invalidateAll(target, options = {}) {
  const targetMap = entries.get(target);
  if (targetMap) {
    for (const entry of targetMap.values()) {
      invalidateEntry(entry, options);
    }
  }
}

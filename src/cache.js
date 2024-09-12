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
      assertValue: undefined,
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
export function getCurrentValue() {
  return context?.value;
}

export function get(target, key, fn) {
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

    entry.value = fn(target, entry.assertValue);
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

export function assert(target, key, value, force) {
  if (context && context.target === target && !force) {
    throw Error(
      `Try to update the '${key}' property while getting the '${context.key}' property`,
    );
  }

  const entry = getEntry(target, key);

  entry.value = undefined;
  entry.assertValue = value;

  dispatch(entry);
}

export function set(target, key, fn, value) {
  const entry = getEntry(target, key);
  const nextValue = fn(target, value, entry.value);

  if (nextValue !== entry.value) {
    entry.value = nextValue;
    entry.assertValue = undefined;

    dispatch(entry);
  }
}

export function observe(target, key, fn, callback) {
  const entry = getEntry(target, key);

  entry.observe = () => {
    const value = get(target, key, fn);

    if (value !== entry.lastValue) {
      callback(target, value, entry.lastValue);
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
    entry.assertValue = undefined;
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

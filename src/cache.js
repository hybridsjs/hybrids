import global from "./global.js";
import * as emitter from "./emitter.js";

const entries = new WeakMap();
export function getEntry(target, key) {
  let targetMap = entries.get(target);
  if (!targetMap) {
    targetMap = new Map();
    entries.set(target, targetMap);
  }

  let entry = targetMap.get(key);

  if (!entry) {
    entry = {
      target,
      key,
      value: undefined,
      lastValue: undefined,
      contexts: new Set(),
      deps: new Set(),
      state: 0,
      depState: 0,
      resolved: false,
    };
    targetMap.set(key, entry);
  }

  return entry;
}

export function getEntries(target) {
  const targetMap = entries.get(target);
  if (targetMap) return [...targetMap.values()];
  return [];
}

function dispatchDeep(entry) {
  entry.resolved = false;

  emitter.dispatch(entry);

  for (const context of entry.contexts) {
    dispatchDeep(context);
  }
}

let context = null;
const contexts = new Set();
export function get(target, key, getter) {
  const entry = getEntry(target, key);

  if (context) {
    context.deps.add(entry);
    entry.contexts.add(context);
  }

  if (entry.resolved) return entry.value;

  if (entry.depState > entry.state) {
    let depState = entry.state;

    for (const depEntry of entry.deps) {
      depEntry.target[depEntry.key];

      if (!depEntry.resolved) {
        depState = false;
        break;
      }

      depState += depEntry.state;
    }

    if (depState && depState === entry.depState) {
      entry.resolved = true;
      return entry.value;
    }
  }

  const lastContext = context;

  try {
    if (contexts.has(entry)) {
      throw Error(`Circular get invocation is forbidden: '${key}'`);
    }

    for (const depEntry of entry.deps) {
      depEntry.contexts.delete(entry);
    }

    entry.deps.clear();
    context = entry;
    contexts.add(entry);

    const nextValue = getter(target, entry.value);

    context = lastContext;

    if (nextValue !== entry.value) {
      entry.value = nextValue;
      entry.state += 1;
    }

    let depState = entry.state;
    for (const depEntry of entry.deps) {
      depState += depEntry.state;
    }

    entry.depState = depState;
    entry.resolved = true;

    contexts.delete(entry);
  } catch (e) {
    context = lastContext;
    contexts.delete(entry);

    entry.resolved = false;

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
    entry.state += 1;
    entry.depState = 0;

    dispatchDeep(entry);
  }
}

const gcList = new Set();
function deleteEntry(entry) {
  if (!gcList.size) {
    global.requestAnimationFrame(() => {
      for (const e of gcList) {
        if (e.contexts.size === 0) {
          for (const depEntry of e.deps) {
            depEntry.contexts.delete(e);
          }

          const targetMap = entries.get(e.target);
          targetMap.delete(e.key);
        }
      }

      gcList.clear();
    });
  }

  gcList.add(entry);
}

function invalidateEntry(entry, options) {
  entry.depState = 0;
  dispatchDeep(entry);

  if (options.clearValue) {
    entry.value = undefined;
    entry.lastValue = undefined;
  }

  if (options.deleteEntry) {
    deleteEntry(entry);
  }

  if (options.force) {
    entry.state += 1;
  }
}

export function invalidate(target, key, options = {}) {
  if (contexts.size) {
    throw Error(
      `Invalidating property in chain of get calls is forbidden: '${key}'`,
    );
  }

  const entry = getEntry(target, key);
  invalidateEntry(entry, options);
}

export function invalidateAll(target, options = {}) {
  if (contexts.size) {
    throw Error(
      "Invalidating all properties in chain of get calls is forbidden",
    );
  }

  const targetMap = entries.get(target);
  if (targetMap) {
    for (const entry of targetMap.values()) {
      invalidateEntry(entry, options);
    }
  }
}

export function observe(target, key, getter, fn) {
  const entry = getEntry(target, key);

  return emitter.subscribe(entry, () => {
    const value = get(target, key, getter);

    if (value !== entry.lastValue) {
      fn(target, value, entry.lastValue);
      entry.lastValue = value;
    }
  });
}

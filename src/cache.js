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
      contexts: undefined,
      deps: undefined,
      state: 0,
      checksum: 0,
      observed: false,
    };
    targetMap.set(key, entry);
  }

  return entry;
}

export function getEntries(target) {
  const result = [];
  const targetMap = entries.get(target);
  if (targetMap) {
    targetMap.forEach(entry => {
      result.push(entry);
    });
  }
  return result;
}

function calculateChecksum(entry) {
  let checksum = entry.state;
  if (entry.deps) {
    entry.deps.forEach(depEntry => {
      checksum += depEntry.state;
    });
  }

  return checksum;
}

function dispatchDeep(entry) {
  if (entry.observed) emitter.dispatch(entry);
  if (entry.contexts) entry.contexts.forEach(dispatchDeep);
}

function restoreDeepDeps(entry, deps) {
  if (deps) {
    deps.forEach(depEntry => {
      entry.deps.add(depEntry);

      if (entry.observed) {
        /* istanbul ignore if */
        if (!depEntry.contexts) depEntry.contexts = new Set();
        depEntry.contexts.add(entry);
      }

      restoreDeepDeps(entry, depEntry.deps);
    });
  }
}

const contextStack = new Set();
export function get(target, key, getter, validate) {
  const entry = getEntry(target, key);

  if (contextStack.size && contextStack.has(entry)) {
    throw Error(`Circular get invocation is forbidden: '${key}'`);
  }

  contextStack.forEach(context => {
    if (!context.deps) context.deps = new Set();
    context.deps.add(entry);

    if (context.observed) {
      if (!entry.contexts) entry.contexts = new Set();
      entry.contexts.add(context);
    }
  });

  if (
    ((validate && validate(entry.value)) || !validate) &&
    entry.checksum &&
    entry.checksum === calculateChecksum(entry)
  ) {
    return entry.value;
  }

  try {
    contextStack.add(entry);

    if (entry.observed && entry.deps && entry.deps.size) {
      entry.deps.forEach(depEntry => {
        /* istanbul ignore else */
        if (depEntry.contexts) depEntry.contexts.delete(entry);
      });
    }

    entry.deps = undefined;
    const nextValue = getter(target, entry.value);

    if (entry.deps) {
      entry.deps.forEach(depEntry => {
        restoreDeepDeps(entry, depEntry.deps);
      });
    }

    if (nextValue !== entry.value) {
      entry.state += 1;
      entry.value = nextValue;

      dispatchDeep(entry);
    }

    entry.checksum = calculateChecksum(entry);
    contextStack.delete(entry);
  } catch (e) {
    entry.checksum = 0;

    contextStack.delete(entry);
    contextStack.forEach(context => {
      context.deps.delete(entry);
      if (context.observed) entry.contexts.delete(context);
    });

    throw e;
  }

  return entry.value;
}

export function set(target, key, setter, value) {
  const entry = getEntry(target, key);
  const newValue = setter(target, value, entry.value);

  if (newValue !== entry.value) {
    entry.checksum = 0;
    entry.state += 1;
    entry.value = newValue;

    dispatchDeep(entry);
  }
}

const gcList = new Set();
function deleteEntry(entry) {
  if (!gcList.size) {
    requestAnimationFrame(() => {
      gcList.forEach(e => {
        if (!e.contexts || (e.contexts && e.contexts.size === 0)) {
          const targetMap = entries.get(e.target);
          targetMap.delete(e.key);
        }
      });
      gcList.clear();
    });
  }

  gcList.add(entry);
}

function invalidateEntry(entry, clearValue, deleteValue) {
  entry.checksum = 0;
  entry.state += 1;

  dispatchDeep(entry);
  if (deleteValue) deleteEntry(entry);

  if (clearValue) {
    entry.value = undefined;
  }
}

export function invalidate(target, key, clearValue, deleteValue) {
  if (contextStack.size) {
    throw Error(
      `Invalidating property in chain of get calls is forbidden: '${key}'`,
    );
  }

  const entry = getEntry(target, key);
  invalidateEntry(entry, clearValue, deleteValue);
}

export function invalidateAll(target, clearValue, deleteValue) {
  if (contextStack.size) {
    throw Error(
      "Invalidating all properties in chain of get calls is forbidden",
    );
  }

  const targetMap = entries.get(target);
  if (targetMap) {
    targetMap.forEach(entry => {
      invalidateEntry(entry, clearValue, deleteValue);
    });
  }
}

export function observe(target, key, getter, fn) {
  const entry = getEntry(target, key);
  entry.observed = true;

  let lastValue;
  const unsubscribe = emitter.subscribe(entry, () => {
    const value = get(target, key, getter);
    if (value !== lastValue) {
      fn(target, value, lastValue);
      lastValue = value;
    }
  });

  if (entry.deps) {
    entry.deps.forEach(depEntry => {
      /* istanbul ignore else */
      if (!depEntry.contexts) depEntry.contexts = new Set();
      depEntry.contexts.add(entry);
    });
  }

  return function unobserve() {
    unsubscribe();
    entry.observed = false;
    if (entry.deps && entry.deps.size) {
      entry.deps.forEach(depEntry => {
        /* istanbul ignore else */
        if (depEntry.contexts) depEntry.contexts.delete(entry);
      });
    }
  };
}

import * as emitter from "./emitter.js";

const entries = new WeakMap();
const suspense = new WeakSet();

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
      getter: undefined,
      validate: undefined,
      value: undefined,
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
  const result = [];
  const targetMap = entries.get(target);
  if (targetMap) {
    targetMap.forEach(entry => {
      result.push(entry);
    });
  }
  return result;
}

function dispatchDeep(entry) {
  entry.resolved = false;

  emitter.dispatch(entry);
  entry.contexts.forEach(dispatchDeep);
}

const contexts = [];
export function get(target, key, getter, validate) {
  const entry = getEntry(target, key);

  if (contexts.includes(entry)) {
    throw Error(`Circular get invocation is forbidden: '${key}'`);
  }

  const context = contexts[0];

  if (context && !suspense.has(context.target)) {
    context.deps.add(entry);
    entry.contexts.add(context);
  }

  if (!suspense.has(target)) {
    if (entry.resolved && (!validate || (validate && validate(entry.value)))) {
      return entry.value;
    }

    if (entry.depState > entry.state && !validate) {
      let depState = entry.state;

      for (const depEntry of entry.deps) {
        // eslint-disable-next-line no-unused-expressions
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
  }

  try {
    contexts.unshift(entry);

    entry.deps.forEach(depEntry => {
      depEntry.contexts.delete(entry);
    });
    entry.deps.clear();

    const nextValue = getter(target, entry.value);

    if (nextValue !== entry.value) {
      entry.value = nextValue;
      entry.state += 1;

      dispatchDeep(entry);
    }

    let depState = entry.state;
    entry.deps.forEach(depEntry => {
      depState += depEntry.state;
    });

    entry.depState = depState;
    entry.resolved = !suspense.has(target);

    contexts.shift();
  } catch (e) {
    contexts.shift();

    entry.resolved = false;

    if (context && !suspense.has(context)) {
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

    dispatchDeep(entry);
  }
}

const gcList = new Set();
function deleteEntry(entry) {
  if (!gcList.size) {
    requestAnimationFrame(() => {
      gcList.forEach(e => {
        if (e.contexts.size === 0) {
          e.deps.forEach(depEntry => {
            depEntry.contexts.delete(e);
          });

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
  entry.depState = 0;

  dispatchDeep(entry);

  if (clearValue) {
    entry.value = undefined;
  }

  if (deleteValue) {
    deleteEntry(entry);
  }
}

export function invalidate(target, key, clearValue, deleteValue) {
  if (contexts.length) {
    throw Error(
      `Invalidating property in chain of get calls is forbidden: '${key}'`,
    );
  }

  const entry = getEntry(target, key);
  invalidateEntry(entry, clearValue, deleteValue);
}

export function invalidateAll(target, clearValue, deleteValue) {
  if (contexts.length) {
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
  let lastValue;

  return emitter.subscribe(entry, () => {
    if (!suspense.has(target)) {
      const value = get(target, key, getter);
      if (value !== lastValue) {
        fn(target, value, lastValue);
        lastValue = value;
      }
    }
  });
}

const clearTargets = new Set();
export function clear(target) {
  if (clearTargets.size === 0) {
    requestAnimationFrame(() => {
      clearTargets.forEach(t => {
        const targetMap = entries.get(t);
        if (targetMap) {
          targetMap.forEach(entry => {
            entry.resolved = false;

            entry.deps.forEach(depEntry => {
              depEntry.contexts.delete(entry);
            });

            entry.deps.clear();
            entry.contexts.clear();
          });
        }
      });

      clearTargets.clear();
    });
  }
  clearTargets.add(target);
}

export function suspend(target) {
  suspense.add(target);
}

export function unsuspend(target) {
  suspense.delete(target);
  clearTargets.delete(target);
}

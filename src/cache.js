import * as emitter from "./emitter.js";

const entries = new WeakMap();
const stack = new Set();

const registry = new FinalizationRegistry(({ ref, depsContexts }) => {
  for (const contexts of depsContexts) contexts.delete(ref);
});

function* getContexts(entry) {
  if (!entry.contexts) return;

  for (const ref of entry.contexts) {
    const context = ref.deref();
    if (context) yield context;
    else entry.contexts.delete(ref);
  }
}

function dispatch(entry, resolved = false) {
  const contexts = [];
  let index = 0;

  entry.resolved = resolved;

  while (entry) {
    for (const context of getContexts(entry)) {
      if (!stack.has(context) && !contexts.includes(context)) {
        context.resolved = false;
        contexts.push(context);
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
      depsContexts: new Set(),
      ref: undefined,
      observe: undefined,
    };

    entry.ref = new WeakRef(entry);
    registry.register(entry, {
      ref: entry.ref,
      depsContexts: entry.depsContexts,
    });

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

    entry.contexts.add(context.ref);
    context.deps.add(entry);
    context.depsContexts.add(entry.contexts);
  }

  if (entry.resolved) return entry.value;

  if (entry.deps) {
    for (const depEntry of entry.deps) {
      depEntry.contexts.delete(entry.ref);
    }
    entry.deps.clear();
    entry.depsContexts.clear();
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
      context.depsContexts.delete(entry.contexts);
      entry.contexts.delete(context.ref);
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

export function sync(target, key, fn, value) {
  const entry = getEntry(target, key);
  const nextValue = fn(target, value, entry.value);

  if (nextValue !== entry.value) {
    entry.value = nextValue;
    entry.assertValue = undefined;

    dispatch(entry, true);

    // mark as resolved to avoid double fn call in get
    entry.resolved = true;
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

const pendingDeletes = new Set();
function deleteEntry(entry) {
  if (!pendingDeletes.size) {
    setTimeout(() => {
      for (const e of pendingDeletes) {
        if (getContexts(e).next().done) {
          const targetMap = entries.get(e.target);
          targetMap.delete(e.key);
        }
      }

      pendingDeletes.clear();
    });
  }

  pendingDeletes.add(entry);
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
        depEntry.contexts.delete(entry.ref);
      }
      entry.deps = undefined;
      entry.depsContexts.clear();
    }

    for (const context of getContexts(entry)) {
      context.deps.delete(entry);
      context.depsContexts.delete(entry.contexts);
    }
    entry.contexts = undefined;

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

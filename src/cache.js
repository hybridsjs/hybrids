import { stringifyElement } from './utils';
import * as emitter from './emitter';

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
      state: 1,
      checksum: 0,
      observed: false,
    };
    targetMap.set(key, entry);
  }

  return entry;
}

function calculateChecksum(entry) {
  let checksum = entry.state;
  if (entry.deps) {
    entry.deps.forEach((depEntry) => {
      // eslint-disable-next-line no-unused-expressions
      depEntry.target[depEntry.key];
      checksum += depEntry.state;
    });
  }

  return checksum;
}

function dispatchDeep(entry) {
  if (entry.observed) emitter.dispatch(entry);
  if (entry.contexts) entry.contexts.forEach(dispatchDeep);
}

let context = null;
export function get(target, key, getter) {
  const entry = getEntry(target, key);

  if (context === entry) {
    context = null;
    throw Error(`Circular '${key}' get invocation in '${stringifyElement(target)}'`);
  }

  if (context) {
    context.deps = context.deps || new Set();
    context.deps.add(entry);
  }

  if (context && (context.observed || (context.contexts && context.contexts.size))) {
    entry.contexts = entry.contexts || new Set();
    entry.contexts.add(context);
  }

  const parentContext = context;
  context = entry;

  if (entry.checksum && entry.checksum === calculateChecksum(entry)) {
    context = parentContext;
    return entry.value;
  }

  if (entry.deps && entry.deps.size) {
    entry.deps.forEach((depEntry) => {
      if (depEntry.contexts) depEntry.contexts.delete(entry);
    });
    entry.deps = undefined;
  }

  try {
    const nextValue = getter(target, entry.value);

    if (nextValue !== entry.value) {
      entry.state += 1;
      entry.value = nextValue;

      dispatchDeep(entry);
    }

    entry.checksum = calculateChecksum(entry);
    context = parentContext;
  } catch (e) {
    context = null;
    throw e;
  }

  return entry.value;
}

export function set(target, key, setter, value) {
  if (context) {
    context = null;
    throw Error(`Try to set '${key}' of '${stringifyElement(target)}' in get call`);
  }

  const entry = getEntry(target, key);
  const newValue = setter(target, value, entry.value);

  if (newValue !== entry.value) {
    entry.state += 1;
    entry.value = newValue;

    dispatchDeep(entry);
  }
}

export function invalidate(target, key, clearValue) {
  if (context) {
    context = null;
    throw Error(`Try to invalidate '${key}' in '${stringifyElement(target)}' get call`);
  }

  const entry = getEntry(target, key);

  entry.checksum = 0;
  dispatchDeep(entry);

  if (clearValue) {
    entry.value = undefined;
  }
}

export function observe(target, key, fn) {
  const entry = getEntry(target, key);
  entry.observed = true;
  return emitter.subscribe(entry, fn);
}

// @flow

import { stringifyElement } from './utils';

type CacheTarget = any;
type CacheKey = string;
type CacheValue = any;
type CacheEntry = {|
  target: CacheTarget,
  key: CacheKey, state: number,
  checksum: number,
  deps: Set<CacheEntry>,
  value: CacheValue
|};

const entries = new WeakMap();
export function getEntry(target: CacheTarget, key: CacheKey): CacheEntry {
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
      deps: new Set(),
      state: 1,
      checksum: 0,
    };
    targetMap.set(key, entry);
  }

  return entry;
}

function calculateChecksum({ state, deps }: CacheEntry): number {
  let checksum = state;
  deps.forEach((entry) => {
    // eslint-disable-next-line no-unused-expressions
    entry.target[entry.key];
    checksum += entry.state;
  });

  return checksum;
}

let context = null;
export function get(target: CacheTarget, key: CacheKey, getter: (CacheTarget, CacheValue) => CacheValue): CacheValue {
  const entry = getEntry(target, key);

  if (context === entry) {
    context = null;
    throw Error(`[cache] Circular '${key}' get invocation in '${stringifyElement(target)}'`);
  }

  if (context) {
    context.deps.add(entry);
  }

  const parentContext = context;
  context = entry;

  if (entry.checksum && entry.checksum === calculateChecksum(entry)) {
    context = parentContext;
    return entry.value;
  }

  entry.deps.clear();

  try {
    const nextValue = getter(target, entry.value);

    if (nextValue !== entry.value) {
      entry.state += 1;
      entry.value = nextValue;
    }

    entry.checksum = calculateChecksum(entry);
    context = parentContext;
  } catch (e) {
    context = null;
    throw e;
  }

  return entry.value;
}

export function set(
  target: CacheTarget,
  key: CacheKey,
  setter: (CacheTarget, CacheValue, CacheValue) => CacheValue,
  value: CacheValue,
  callback: () => void
): void {
  if (context) {
    context = null;
    throw Error(`[cache] Try to set '${key}' of '${stringifyElement(target)}' in get call`);
  }

  const entry = getEntry(target, key);
  const newValue = setter(target, value, entry.value);

  if (newValue !== entry.value) {
    entry.state += 1;
    entry.value = newValue;

    callback();
  }
}

export function invalidate(target: Element, key: CacheKey, clearValue: boolean): void {
  if (context) {
    context = null;
    throw Error(`[cache] Try to invalidate '${key}' in '${stringifyElement(target)}' get call`);
  }

  const entry = getEntry(target, key);

  entry.checksum = 0;

  if (clearValue) {
    entry.value = undefined;
  }
}

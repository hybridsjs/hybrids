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
      state: 0,
      value: undefined,
      deps: undefined,
      checksum: undefined,
    };
    targetMap.set(key, entry);
  }

  return entry;
}

function calculateChecksum({ state, deps }) {
  return deps.reduce(
    (acc, entry) => acc + calculateChecksum(entry),
    state,
  );
}

let context = null;
export function get(target, key, getter) {
  const entry = getEntry(target, key);

  if (context === entry) {
    context = null;
    throw Error(`[cache] Try to get '${key}' of '${target}' in '${key}' get call`);
  }

  if (context) {
    context.deps.push(entry);
  }

  if (entry.checksum >= entry.state && entry.checksum === calculateChecksum(entry)) {
    return entry.value;
  }

  const parentContext = context;
  context = entry;

  entry.deps = [];

  try {
    entry.value = getter(target, entry.value);
  } catch (e) {
    context = null;
    throw e;
  }

  context = parentContext;

  entry.checksum = calculateChecksum(entry);

  return entry.value;
}

export function set(target, key, setter, value, callback) {
  if (context) {
    context = null;
    throw Error(`[cache] Try to set '${key}' of '${target}' in get call`);
  }

  const entry = getEntry(target, key);
  const newValue = setter(target, value, entry.value);

  if (newValue !== entry.value) {
    entry.state += 1;
    entry.value = newValue;

    callback();
  }
}

export function invalidate(target, key, clearValue) {
  if (context) {
    context = null;
    throw Error(`[cache] Try to invalidate '${key}' in '${target}' get call`);
  }

  const entry = getEntry(target, key);

  entry.state += 1;

  if (clearValue) {
    entry.value = undefined;
  }
}

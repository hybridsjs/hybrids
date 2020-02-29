function normalizeValue(value, set = new Set()) {
  if (Array.isArray(value)) {
    value.forEach(className => set.add(className));
  } else if (value !== null && typeof value === "object") {
    Object.keys(value).forEach(key => value[key] && set.add(key));
  } else {
    set.add(value);
  }

  return set;
}

const classMap = new WeakMap();

export default function resolveClassList(host, target, value) {
  const previousList = classMap.get(target) || new Set();
  const list = normalizeValue(value);

  classMap.set(target, list);

  list.forEach(className => {
    target.classList.add(className);
    previousList.delete(className);
  });

  previousList.forEach(className => {
    target.classList.remove(className);
  });
}

function normalizeValue(value, set = new Set()) {
  if (Array.isArray(value)) {
    for (const className of value) {
      if (className) set.add(className);
    }
  } else if (value !== null && typeof value === "object") {
    for (const [className, condition] of Object.entries(value)) {
      if (className && condition) set.add(className);
    }
  } else {
    if (value) set.add(value);
  }

  return set;
}

const classMap = new WeakMap();

export default function resolveClassList(host, target, value) {
  const previousList = classMap.get(target) || new Set();
  const list = normalizeValue(value);

  classMap.set(target, list);

  for (const className of list) {
    target.classList.add(className);
    previousList.delete(className);
  }

  for (const className of previousList) {
    target.classList.remove(className);
  }
}

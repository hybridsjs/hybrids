function addClassNames(set, value) {
  if (value) {
    for (const className of String(value).split(/\s+/)) {
      if (className) set.add(className);
    }
  }
}

function normalizeValue(value) {
  const set = new Set();

  if (Array.isArray(value)) {
    for (const v of value) {
      addClassNames(set, v);
    }
  } else if (value !== null && typeof value === "object") {
    for (const [v, condition] of Object.entries(value)) {
      if (v && condition) addClassNames(set, v);
    }
  } else {
    addClassNames(set, value);
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

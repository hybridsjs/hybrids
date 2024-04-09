import { camelToDash } from "./utils.js";

const setters = {
  string: (host, value, attrName) => {
    const nextValue = value ? String(value) : "";
    if (nextValue) {
      host.setAttribute(attrName, nextValue);
    } else {
      host.removeAttribute(attrName);
    }

    return nextValue;
  },
  number: (host, value, attrName) => {
    const nextValue = Number(value);
    host.setAttribute(attrName, nextValue);
    return nextValue;
  },
  boolean: (host, value, attrName) => {
    const nextValue = Boolean(value);
    if (nextValue) {
      host.setAttribute(attrName, "");
    } else {
      host.removeAttribute(attrName);
    }
    return nextValue;
  },
  undefined: (host, value, attrName) => {
    const type = typeof value;
    const set = type !== "undefined" && setters[type];
    if (set) {
      return set(host, value, attrName);
    } else if (host.hasAttribute(attrName)) {
      host.removeAttribute(attrName);
    }

    return value;
  },
};

export default function value(key, desc) {
  const type = typeof desc.value;
  const set = setters[type];

  if (!set) {
    throw TypeError(
      `Invalid default value for '${key}' property - it must be a string, number, boolean or undefined: ${type}`,
    );
  }

  const attrName = camelToDash(key);

  return {
    get: (host, value) => (value === undefined ? desc.value : value),
    set: (host, value) => set(host, value, attrName),
    connect:
      type !== "undefined"
        ? (host, key, invalidate) => {
            if (!host.hasAttribute(attrName) && host[key] === desc.value) {
              host[key] = set(host, desc.value, attrName);
            }

            return desc.connect && desc.connect(host, key, invalidate);
          }
        : desc.connect,
    observe: desc.observe,
  };
}

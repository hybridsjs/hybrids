import { camelToDash } from "./utils.js";

const constructors = {
  string: String,
  number: Number,
  boolean: Boolean,
  default: (v) => v,
};

const reflects = {
  string: (host, value, attrName) => {
    if (value) {
      host.setAttribute(attrName, value);
    } else {
      host.removeAttribute(attrName);
    }
  },
  number: (host, value, attrName) => {
    host.setAttribute(attrName, value);
  },
  boolean: (host, value, attrName) => {
    if (value) {
      host.setAttribute(attrName, "");
    } else {
      host.removeAttribute(attrName);
    }
  },
  default: (host, value, attrName) => {
    if (value !== undefined) {
      host.setAttribute(attrName, value);
    } else {
      host.removeAttribute(attrName);
    }
  },
};

export default function value(key, desc) {
  const attrName = camelToDash(key);
  const defaultValue =
    typeof desc.value === "object" ? Object.freeze(desc.value) : desc.value;
  const type = typeof defaultValue;

  const constructor = constructors[type] || constructors.default;
  const reflect = reflects[type] || reflects.default;

  let observe = desc.observe;

  if (desc.reflect) {
    const fn =
      typeof desc.reflect === "function"
        ? (host, value, attrName) =>
            reflect(host, desc.reflect(value), attrName)
        : reflect;

    observe = desc.observe
      ? (host, value, lastValue) => {
          fn(host, value, attrName);
          desc.observe(host, value, lastValue);
        }
      : (host, value) => reflect(host, value, attrName);
  }

  return {
    ...desc,
    value:
      type === "function"
        ? defaultValue
        : (host, value) =>
            value !== undefined ? constructor(value) : defaultValue,
    observe,
    writable: type !== "function" || defaultValue.length > 1,
  };
}

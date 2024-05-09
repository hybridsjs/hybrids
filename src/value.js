import { camelToDash } from "./utils.js";

const transformers = {
  string: (v) => String(v ?? ""),
  number: Number,
  boolean: Boolean,
  default: (v) => v,
};

function reflect(host, value, attrName) {
  if (!value && value !== 0) {
    host.removeAttribute(attrName);
  } else {
    host.setAttribute(attrName, value === true ? "" : value);
  }
}

export default function value(key, desc) {
  const attrName = camelToDash(key);
  const defaultValue =
    typeof desc.value === "object" ? Object.freeze(desc.value) : desc.value;
  const type = typeof defaultValue;

  const transform = transformers[type] || transformers.default;

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
            value !== undefined ? transform(value) : defaultValue,
    observe,
    writable: type !== "function" || defaultValue.length > 1,
  };
}

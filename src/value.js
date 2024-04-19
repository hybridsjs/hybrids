import { camelToDash } from "./utils.js";

const setters = {
  string: (v) => String(v ?? ""),
  number: Number,
  boolean: Boolean,
  undefined: (value) => value,
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

  function reflect(host, value) {
    if (!value && value !== 0) {
      host.removeAttribute(attrName);
    } else {
      host.setAttribute(attrName, value === true ? "" : value);
    }
  }

  return {
    get: (host, value) => (value === undefined ? desc.value : value),
    set: (host, value) => set(value),
    connect: desc.connect,
    observe:
      type === "undefined"
        ? desc.observe
        : desc.observe
          ? (host, value, lastValue) => {
              reflect(host, value);
              desc.observe(host, value, lastValue);
            }
          : reflect,
  };
}

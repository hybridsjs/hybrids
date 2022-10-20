import { camelToDash } from "./utils.js";

function string(desc, attrName) {
  const defaultValue = desc.value;

  return {
    get: (host, value) =>
      value === undefined ? host.getAttribute(attrName) || defaultValue : value,
    set: (host, value) => {
      value = String(value);

      if (value) {
        host.setAttribute(attrName, value);
      } else {
        host.removeAttribute(attrName);
      }

      return value;
    },
    connect:
      defaultValue !== ""
        ? (host, key, invalidate) => {
            if (!host.hasAttribute(attrName) && host[key] === defaultValue) {
              host.setAttribute(attrName, defaultValue);
            }
            // istanbul ignore next
            return desc.connect && desc.connect(host, key, invalidate);
          }
        : desc.connect,
    observe: desc.observe,
  };
}

function number(desc, attrName) {
  const defaultValue = desc.value;

  return {
    get: (host, value) =>
      value === undefined
        ? Number(host.getAttribute(attrName) || defaultValue)
        : value,
    set: (host, value) => {
      value = Number(value);
      host.setAttribute(attrName, value);
      return value;
    },
    connect: (host, key, invalidate) => {
      if (!host.hasAttribute(attrName) && host[key] === defaultValue) {
        host.setAttribute(attrName, defaultValue);
      }
      // istanbul ignore next
      return desc.connect && desc.connect(host, key, invalidate);
    },
    observe: desc.observe,
  };
}

function boolean(desc, attrName) {
  const defaultValue = desc.value;

  return {
    get: (host, value) =>
      value === undefined ? host.hasAttribute(attrName) || defaultValue : value,
    set: (host, value) => {
      value = Boolean(value);

      if (value) {
        host.setAttribute(attrName, "");
      } else {
        host.removeAttribute(attrName);
      }

      return value;
    },
    connect:
      defaultValue === true
        ? (host, key, invalidate) => {
            if (!host.hasAttribute(attrName) && host[key] === defaultValue) {
              host.setAttribute(attrName, "");
            }
            // istanbul ignore next
            return desc.connect && desc.connect(host, key, invalidate);
          }
        : desc.connect,
    observe: desc.observe,
  };
}

function undef(desc, attrName) {
  const defaultValue = desc.value;

  return {
    get: (host, value) =>
      value === undefined ? host.getAttribute(attrName) || defaultValue : value,
    set: (host, value) => value,
    connect: desc.connect,
    observe: desc.observe,
  };
}

export default function value(key, desc) {
  const type = typeof desc.value;
  const attrName = camelToDash(key);

  switch (type) {
    case "string":
      return string(desc, attrName);
    case "number":
      return number(desc, attrName);
    case "boolean":
      return boolean(desc, attrName);
    case "undefined":
      return undef(desc, attrName);
    default:
      throw TypeError(
        `Invalid default value for '${key}' property - it must be a string, number, boolean or undefined: ${type}`,
      );
  }
}

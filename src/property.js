import { camelToDash } from "./utils.js";

const defaultTransform = v => v;

const objectTransform = value => {
  if (typeof value !== "object") {
    throw TypeError(`Assigned value must be an object: ${typeof value}`);
  }
  return value && Object.freeze(value);
};

export default function property(value, connect, observe) {
  const attrs = new WeakMap();
  const type = typeof value;
  let transform = defaultTransform;

  switch (type) {
    case "string":
      transform = String;
      break;
    case "number":
      transform = Number;
      break;
    case "boolean":
      transform = Boolean;
      break;
    case "function":
      transform = value;
      value = transform();
      break;
    case "object":
      if (value) Object.freeze(value);
      transform = objectTransform;
      break;
    default:
      break;
  }

  return {
    get: (host, val = value) => val,
    set: (host, val, lastValue = value) => transform(val, lastValue),
    connect:
      type !== "object" && type !== "undefined"
        ? (host, key, invalidate) => {
            if (!attrs.has(host)) {
              const attrName = camelToDash(key);
              attrs.set(host, attrName);

              if (host.hasAttribute(attrName)) {
                const attrValue = host.getAttribute(attrName);
                host[key] =
                  attrValue === "" && transform === Boolean ? true : attrValue;
              }
            }

            return connect && connect(host, key, invalidate);
          }
        : connect,
    observe:
      type !== "object" && type !== "undefined"
        ? (host, val, lastValue) => {
            const attrName = attrs.get(host);

            const attrValue = host.getAttribute(attrName);
            const nextValue = val === true ? "" : val;

            if (nextValue === attrValue) return;

            if (val !== 0 && !val) {
              host.removeAttribute(attrName);
            } else {
              host.setAttribute(attrName, nextValue);
            }

            if (observe) observe(host, val, lastValue);
          }
        : observe,
  };
}

import { storePointer } from "../../utils.js";

function resolveValue({ target, detail }, setter) {
  let value;

  switch (target.type) {
    case "radio":
    case "checkbox":
      value = target.checked && target.value;
      break;
    case "file":
      value = target.files;
      break;
    default:
      value =
        detail && hasOwnProperty.call(detail, "value")
          ? detail.value
          : target.value;
  }

  setter(value);
}

function getPartialObject(name, value) {
  return name
    .split(".")
    .reverse()
    .reduce((acc, key) => {
      if (!acc) return { [key]: value };
      return { [key]: acc };
    }, null);
}

const stringCache = new Map();

export default function set(property, valueOrPath) {
  if (!property) {
    throw Error(
      `The first argument must be a property name or an object instance: ${property}`,
    );
  }

  if (typeof property === "object") {
    if (valueOrPath === undefined) {
      throw Error(
        "For model instance property the second argument must be defined",
      );
    }

    const store = storePointer.get(property);

    if (!store) {
      throw Error("Provided object must be a model instance of the store");
    }

    if (valueOrPath === null) {
      return () => {
        store.set(property, null);
      };
    }

    return (host, event) => {
      resolveValue(event, (value) => {
        store.set(property, getPartialObject(valueOrPath, value));
      });
    };
  }

  if (arguments.length === 2) {
    return (host) => {
      host[property] = valueOrPath;
    };
  }

  let fn = stringCache.get(property);

  if (!fn) {
    fn = (host, event) => {
      resolveValue(event, (value) => {
        host[property] = value;
      });
    };

    stringCache.set(property, fn);
  }

  return fn;
}

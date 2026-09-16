import { removeTemplate } from "../utils.js";
import resolveArray, { arrayMap } from "./array.js";
import resolveNode from "./node.js";
import resolvePromise, { promiseMap } from "./promise.js";

function typeOf(value) {
  const type = typeof value;

  if (type === "object") {
    if (Array.isArray(value)) return "array";
    if (value instanceof globalThis.Node) return "node";
    if (value instanceof Promise) return "promise";
  }

  return type;
}

export default function resolveValue(
  host,
  target,
  value,
  lastValue,
  useLayout,
) {
  const type = typeOf(value);
  let lastType = typeOf(lastValue);

  if (lastType === "promise") {
    lastValue = promiseMap.get(target).lastValue;
    lastType = typeOf(lastValue);

    if (type !== "promise") promiseMap.delete(target);
  }

  if (type === "promise") {
    resolvePromise(host, target, value, lastValue, resolveValue, useLayout);
    return;
  }

  if (lastType !== "undefined" && type !== lastType) {
    if (type !== "function") removeTemplate(target);

    if (lastType === "array") {
      arrayMap.delete(target);
    } else if (lastType !== "node" && lastType !== "function") {
      target.textContent = "";
    }
  }

  switch (type) {
    case "array":
      resolveArray(host, target, value, resolveValue, useLayout);
      break;
    case "node":
      resolveNode(host, target, value);
      break;
    case "function":
      if (useLayout) value.useLayout = true;
      value(host, target);
      break;
    default:
      target.textContent = type === "number" || value ? value : "";
  }
}

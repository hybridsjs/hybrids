import global from "../../global.js";
import { removeTemplate } from "../utils.js";
import resolveArray, { arrayMap } from "./array.js";
import resolveNode from "./node.js";

function typeOf(value) {
  const type = typeof value;

  if (type === "object") {
    if (Array.isArray(value)) return "array";
    if (value instanceof global.Node) return "node";
  }

  return type;
}

export default function resolveValue(host, target, value, lastValue) {
  const type = typeOf(value);
  const lastType = typeOf(lastValue);

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
      resolveArray(host, target, value, resolveValue);
      break;
    case "node":
      resolveNode(host, target, value);
      break;
    case "function":
      value(host, target);
      break;
    default:
      target.textContent = type === "number" || value ? value : "";
  }
}

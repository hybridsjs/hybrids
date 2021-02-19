import { dataMap, removeTemplate } from "../utils.js";
import resolveArray, { arrayMap } from "./array.js";
import resolveNode from "./node.js";

export default function resolveValue(host, target, value) {
  let type = typeof value;
  if (Array.isArray(value)) {
    type = "array";
  } else if (value instanceof Node) {
    type = "node";
  }

  let data = dataMap.get(target, {});

  if (data.type !== type) {
    removeTemplate(target);
    if (type === "array") arrayMap.delete(target);

    data = dataMap.set(target, { type });

    if (target.textContent !== "") {
      target.textContent = "";
    }
  }

  switch (type) {
    case "function":
      value(host, target);
      break;
    case "array":
      resolveArray(host, target, value, resolveValue);
      break;
    case "node":
      resolveNode(host, target, value);
      break;
    default:
      target.textContent = type === "number" || value ? value : "";
  }
}

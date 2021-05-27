import { dataMap } from "../utils.js";

const nodeMap = new WeakMap();

export default function resolveNode(host, target, value) {
  const prevValue = nodeMap.get(target);
  const data = dataMap.get(target, {});

  if (value !== prevValue) {
    if (prevValue) prevValue.parentNode.removeChild(prevValue);

    data.startNode = value;
    data.endNode = value;

    target.parentNode.insertBefore(value, target.nextSibling);
    nodeMap.set(target, value);
  }
}

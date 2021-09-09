import { dataMap } from "../utils.js";

export default function resolveNode(host, target, value, lastValue) {
  const data = dataMap.get(target, {});

  if (lastValue) lastValue.parentNode.removeChild(lastValue);

  data.startNode = value;
  data.endNode = value;

  target.parentNode.insertBefore(value, target.nextSibling);
}

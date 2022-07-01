import { removeTemplate, getMeta } from "../utils.js";

export default function resolveNode(host, target, value) {
  removeTemplate(target);

  const meta = getMeta(target);
  meta.startNode = meta.endNode = value;

  target.parentNode.insertBefore(value, target.nextSibling);
}

export default function attr({ node, expr }, attrName = expr.evaluate) {
  return (value) => {
    if (value === false || value === undefined || value === null) {
      node.removeAttribute(attrName);
    } else {
      node.setAttribute(attrName, value === true ? '' : value);
    }
  };
}

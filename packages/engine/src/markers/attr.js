export default function attr({ node, expr }, attrName = expr.evaluate) {
  return () => {
    const value = expr.get();
    if (value === false || value === undefined || value === null) {
      node.removeAttribute(attrName);
    } else {
      node.setAttribute(attrName, value === true ? '' : value);
    }
  };
}

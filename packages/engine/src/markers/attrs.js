export default function attrs(node, expr, attrName = expr.evaluate) {
  return () => {
    const newValue = expr.get();
    if (newValue === false || newValue === undefined || newValue === null) {
      node.removeAttribute(attrName);
    } else {
      node.setAttribute(attrName, newValue === true ? attrName : newValue);
    }
  };
}

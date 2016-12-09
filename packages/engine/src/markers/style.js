function dashToCamel(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

export default function style(node, expr, ...propertyNames) {
  const list = (propertyNames.length ? propertyNames : [expr.evaluate]).map(dashToCamel);

  return () => {
    const value = expr.get();
    list.forEach((property) => { node.style[property] = value; });
  };
}

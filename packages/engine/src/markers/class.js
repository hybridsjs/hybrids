export default function classList(node, expr, ...classNames) {
  const list = classNames.length ? classNames : [expr.evaluate];

  return () => {
    const value = expr.get();

    list.forEach((name) => {
      if (value) {
        node.classList.add(name);
      } else {
        node.classList.remove(name);
      }
    });
  };
}

import Path from '../path';

export default function prop({ node, expr }, ...paths) {
  const list = (paths.length ? paths : [expr.evaluate]).map(path => new Path(path));

  return () => {
    const value = expr.get();
    list.forEach(path => path.set(node, value));
  };
}

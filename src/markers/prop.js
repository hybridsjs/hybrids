import Path from '../template/path';

export default function prop({ node, expr }, ...paths) {
  const list = (paths.length ? paths : [expr.evaluate]).map(path => new Path(path));

  return (value) => {
    list.forEach(path => path.set(node, value));
  };
}

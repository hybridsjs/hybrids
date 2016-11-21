import { error } from '@hybrids/debug';

export default function props(node, expr, ...propertyNames) {
  const list = propertyNames.length ? propertyNames : [expr.evaluate];

  if (!list.length) {
    error(ReferenceError, '[props]: property name required');
  }

  return () => {
    list.forEach((name) => { node[name] = expr.get(); });
  };
}

import { error } from '@hybrids/debug';

export default function on(node, expr, eventName = expr.evaluate, capture) {
  if (!eventName) {
    error(ReferenceError, '[on]: event name required');
  }

  node.addEventListener(eventName, (event) => {
    expr.call(event);
  }, capture === 'capture');
}

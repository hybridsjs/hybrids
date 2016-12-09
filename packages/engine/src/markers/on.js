export default function on(node, expr, eventName = expr.evaluate, capture) {
  node.addEventListener(eventName, (event) => {
    expr.call(event);
  }, capture === 'capture');
}

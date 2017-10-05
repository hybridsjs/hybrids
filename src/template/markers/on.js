import { stringifyMarker } from '../parser';

export default function on({ node, expr, attr }, eventType, flag) {
  if (process.env.NODE_ENV !== 'production') {
    if (!eventType) {
      throw TypeError('Event type is required');
    }
  }

  node.addEventListener(eventType, (event) => {
    try {
      expr.call(event);
    } catch (error) {
      error.message += `\n\n Execution failed: ${stringifyMarker(node, attr, this.container.t)}`;
      throw error;
    }
  }, flag === 'capture');
}

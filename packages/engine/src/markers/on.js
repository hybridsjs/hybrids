import { LOCALS_PREFIX } from '../expression';
import { stringifyMarker } from '../template';
import { error } from '../debug';

export default function on({ node, expr, attr }, eventType, flag) {
  if (!eventType) {
    error(TypeError, 'on: Event type is required');
  }
  if (!expr.isComputed) {
    error(TypeError, 'on: Computed expression required');
  }

  node.addEventListener(eventType, (event) => {
    try {
      expr.get({ [`${LOCALS_PREFIX}event`]: event });
    } catch (e) {
      error(e, 'on: Execution failed %node', { node: stringifyMarker(node, attr) });
    }
  }, flag === 'capture');
}

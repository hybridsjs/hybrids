import { LOCALS_PREFIX } from '../expression';
import { stringifyMarker } from '../template';
import { error } from '../debug';

export default function on({ node, expr, attr }, eventName = expr.evaluate, flag) {
  node.addEventListener(eventName, (event) => {
    try {
      expr.call({ [`${LOCALS_PREFIX}event`]: event });
    } catch (e) {
      error(e, 'on: Execution failed %node', { node: stringifyMarker(node, attr) });
    }
  }, flag === 'capture');
}

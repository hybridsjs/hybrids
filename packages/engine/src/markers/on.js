import { LOCALS_PREFIX } from '../expression';

export default function on(node, expr, eventName = expr.evaluate, flag) {
  node.addEventListener(eventName, (event) => {
    expr.call({ [`${LOCALS_PREFIX}event`]: event });
  }, flag === 'capture');
}

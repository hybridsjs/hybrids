import { LOCAL_PREFIX } from '../expression';

export default function on(node, expr, eventName = expr.evaluate, flag) {
  node.addEventListener(eventName, (event) => {
    expr.call({ [`${LOCAL_PREFIX}event`]: event });
  }, flag === 'capture');
}

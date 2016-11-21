import Logdown from 'logdown/src/index';

const logger = new Logdown();
const messages = new Map();

function resolve(...args) {
  let e;
  switch (typeof args[0]) {
    case 'function':
      e = args.shift()();
      break;
    case 'object':
      e = args.shift();
      break;
    default:
      e = new Error();
  }

  const msg = args.shift();
  const values = args.slice(0);
  e.message = (e.message ? `${e.message} | ` : '') + msg.replace(/%s/g, () => values.shift());

  if (process.env.NODE_ENV !== 'production') {
    const desc = messages.get(msg);
    if (desc) {
      Promise.resolve().then(() => logger.warn(desc.replace(/%s/g, () => args.shift())));
    }
  }

  return e;
}

export function register(map) {
  Object.keys(map).forEach((key) => {
    messages.set(key, map[key]);
  });
}

export function warning(...args) {
  const e = resolve(...args);
  if (process.env.NODE_ENV !== 'production') {
    logger.error(e);
  } else {
    logger.warn(e);
  }
}

export function error(...args) {
  throw resolve(...args);
}

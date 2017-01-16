import { injectable } from '../proxy';
import { CONTROLLER } from '../symbols';

export function listenTo(host, name, fn, options) {
  const bindFn = (...args) => fn.apply(host[CONTROLLER], args);
  host.addEventListener(name, bindFn, options);
  return () => host.removeEventListener(name, bindFn, options);
}

export default injectable(listenTo);

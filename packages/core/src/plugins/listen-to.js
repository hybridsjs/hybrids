import { injectable } from '../proxy';
import { CONTROLLER } from '../symbols';

export function listenTo(name, fn, options) {
  const bindFn = (...args) => fn.apply(this[CONTROLLER], args);
  this.addEventListener(name, bindFn, options);
  return () => this.removeEventListener(name, bindFn, options);
}

export default injectable(listenTo);

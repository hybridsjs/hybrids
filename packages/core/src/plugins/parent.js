import { error } from '@hybrids/debug';

import { injectable } from '../proxy';
import { CONTROLLER } from '../symbols';

export function parent(Controller) {
  if (!this[CONTROLLER]) return error(Error, '[core|parent] Illegal invocation');
  if (typeof Controller !== 'function') error(TypeError, '[core|parent] Invalid arguments');
  let parentElement = this.parentElement;

  while (parentElement) {
    if (parentElement.constructor[CONTROLLER] === Controller) {
      return parentElement[CONTROLLER];
    }
    parentElement = parentElement.parentElement;
  }

  return null;
}

export default injectable(parent);

import { error } from '../debug';

import { injectable } from '../proxy';
import { CONTROLLER } from '../symbols';

export function parent(Controller) {
  if (typeof Controller !== 'function') error(TypeError, 'parent: Invalid arguments');
  if (!this[CONTROLLER]) return error(Error, 'parent: Illegal invocation');

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

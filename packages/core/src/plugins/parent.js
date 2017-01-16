import { error } from '../debug';

import { injectable } from '../proxy';
import { CONTROLLER } from '../symbols';

export function parent(host, Controller) {
  if (typeof Controller !== 'function') error(TypeError, 'parent: Invalid arguments');
  if (!host[CONTROLLER]) return error(Error, 'parent: Illegal invocation');

  let parentElement = host.parentElement;

  while (parentElement) {
    if (parentElement.constructor[CONTROLLER] === Controller) {
      return parentElement[CONTROLLER];
    }
    parentElement = parentElement.parentElement;
  }

  return null;
}

export default injectable(parent);

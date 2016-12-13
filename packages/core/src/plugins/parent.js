import { error } from '@hybrids/debug';

import { injectable } from '../proxy';
import { CONTROLLER } from '../symbols';

export function parent(Constructor) {
  if (!Constructor) error(TypeError, 'invalid arguments');
  let parentElement = this.parentElement;

  while (parentElement) {
    if (parentElement.constructor[CONTROLLER] === Constructor) {
      return parentElement[CONTROLLER];
    }
    parentElement = parentElement.parentElement;
  }

  return null;
}

export default injectable(parent);

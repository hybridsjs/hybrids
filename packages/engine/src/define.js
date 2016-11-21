import { bootstrap } from '@hybrids/core';
import engine from './engine';

export default function (Controller, middleware = []) {
  return bootstrap(Controller, [engine].concat(middleware));
}

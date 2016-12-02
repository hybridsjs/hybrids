import { bootstrap } from '@hybrids/core';
import engine from './engine';

export default function (Controller, providers = []) {
  return bootstrap(Controller, [engine].concat(providers));
}

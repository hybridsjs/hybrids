import { DEFAULT_MARKER } from './symbols';

import attrs from './markers/attrs';
import foreach from './markers/foreach';
import If from './markers/if';
import on from './markers/on';
import props from './markers/props';

export default {
  attrs,
  foreach,
  if: If,
  on,
  props,
  [DEFAULT_MARKER]: props,
};

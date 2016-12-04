import { DEFAULT_MARKER } from './symbols';

import attrs from './markers/attrs';
import For from './markers/for';
import If from './markers/if';
import on from './markers/on';
import props from './markers/props';

export default {
  attrs,
  for: For,
  if: If,
  on,
  props,
  [DEFAULT_MARKER]: props,
};

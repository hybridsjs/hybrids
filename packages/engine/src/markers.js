import { PROPERTY_MARKER } from './symbols';

import attr from './markers/attr';
import bind from './markers/bind';
import classList from './markers/class';
import For from './markers/for';
import If from './markers/if';
import on from './markers/on';
import prop from './markers/prop';
import ref from './markers/ref';
import style from './markers/style';

export default {
  attr,
  bind,
  class: classList,
  for: For,
  if: If,
  on,
  prop,
  ref,
  style,
  [PROPERTY_MARKER]: prop,
};

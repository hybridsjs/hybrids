import attr from './markers/attr';
import model from './markers/model';
import classList from './markers/class';
import For from './markers/for';
import If from './markers/if';
import on from './markers/on';
import prop from './markers/prop';
import ref from './markers/ref';
import style from './markers/style';

export default {
  attr,
  model,
  class: classList,
  for: For,
  if: If,
  on,
  prop,
  ref,
  style,
};

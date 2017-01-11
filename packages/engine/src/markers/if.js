import { error } from '../debug';
import VirtualFragment from './shared/virtual-fragment';

export default function If({ node, expr }) {
  if (!(node instanceof Comment)) {
    error(TypeError, 'if: Element must be a <template>');
  }

  let fragment;

  return (changelog, engine) => {
    if (expr.get()) {
      fragment = new VirtualFragment(engine.compile(node), node);
      fragment.insertAfter();
    } else {
      if (fragment) fragment.remove();
      fragment = null;
    }
  };
}

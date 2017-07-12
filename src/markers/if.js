import VirtualFragment from './shared/virtual-fragment';

export default function If({ node }) {
  if (process.env.NODE_ENV !== 'production' && !(node instanceof Comment)) {
    throw TypeError('Element must be a <template>');
  }

  let fragment;

  return (value, changelog, compile) => {
    if (value) {
      fragment = new VirtualFragment(compile(node), node);
      fragment.insertAfter();
    } else {
      if (fragment) fragment.remove();
      fragment = null;
    }
  };
}

import { Debug } from '@hybrids/debug';

const debug = new Debug('[@hybrids/vdom]');

if (process.env.NODE_ENV !== 'production') {
  debug.docs({});
}

export const { error, warning } = debug;

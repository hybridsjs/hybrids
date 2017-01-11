import { Debug } from '@hybrids/debug';

const debug = new Debug('[@hybrids/core]');

if (process.env.NODE_ENV !== 'production') {
  debug.docs({});
}

export const { error, warning } = debug;

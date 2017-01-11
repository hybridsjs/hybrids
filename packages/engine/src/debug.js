import { Debug } from '@hybrids/debug';

const debug = new Debug('[@hybrids/engine]');

if (process.env.NODE_ENV !== 'production') {
  debug.docs({
    '"%property" must be defined': `
      Define \`this.%property\` in controller \`constructor()\` or \`connected()\` method.
    `,
    '"%property" in "%evaluate" must be defined': `
      *Root property of path must be defined*
      Set default value for \`this.%property\` in controller \`constructor()\` or \`connected()\` method.
    `
  });
}

export const { error, warning } = debug;

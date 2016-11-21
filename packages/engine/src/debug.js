/* eslint-disable */
import { register } from '@hybrids/debug';

if (process.env.NODE_ENV !== 'production') register({
  "'%s': root property must be defined: %s":

`*Root property of* \`%s\` *path must be defined*
Define \`this.%s\` in controller \`constructor()\` or \`connected()\` method.`,
});

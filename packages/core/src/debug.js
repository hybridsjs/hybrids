/* eslint-disable */
import { register } from '@hybrids/debug';

if (process.env.NODE_ENV !== 'production') register({
  "'%s': public property must be defined":

`*Public property must be defined in controller*
Default value of public property must be set. Define \`this.%s\` in controller \`constructor()\` method.`,

  "invalid type coercion from '%s' to '%s'":
`*Invalid type coercion*
Something`,

  "reflect attribute '%s' to property '%s'":

`*Reflecting attribute to property*
If type coercion from string value of attribute to property cannot be done, reflection is omitted.`
});

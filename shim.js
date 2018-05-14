/* eslint-disable global-require */
require('@webcomponents/webcomponents-platform');
require('@webcomponents/template');

if (typeof document.createElement('div').attachShadow !== 'function') {
  require('@webcomponents/shadydom');
  require('@webcomponents/shadycss/scoping-shim.min');
}

if (typeof customElements !== 'object') {
  require('@webcomponents/custom-elements');
}

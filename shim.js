/* eslint-disable global-require */

// Web APIs polyfills for IE11
if ('ActiveXObject' in window) {
  require('core-js/fn/array/find');
  require('core-js/fn/reflect/construct');
  require('core-js/es6/promise');
}

require('@webcomponents/webcomponents-platform');
require('@webcomponents/template');

if (!document.createElement('div').attachShadow) {
  require('@webcomponents/shadydom');
  require('@webcomponents/shadycss/scoping-shim.min');
}

if (typeof customElements !== 'object') {
  require('@webcomponents/custom-elements');
}

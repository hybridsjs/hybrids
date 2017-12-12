/* eslint-disable global-require */
require('@webcomponents/template');

if (!document.body.attachShadow) require('@webcomponents/shadydom');
if (!window.customElements) require('@webcomponents/custom-elements');

require('@webcomponents/shadycss/scoping-shim.min');

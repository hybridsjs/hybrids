/* eslint-disable global-require */
require('@webcomponents/template');

if (!window.customElements) require('@webcomponents/custom-elements');
if (!document.body.attachShadow) require('@webcomponents/shadydom');

require('@webcomponents/shadycss/scoping-shim.min');
require('@webcomponents/shadycss/apply-shim.min');

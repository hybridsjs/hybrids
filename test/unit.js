/* eslint-disable import/no-extraneous-dependencies, global-require */
require('core-js/shim');

if (!window.customElements) require('@webcomponents/custom-elements');
if (!document.body.attachShadow) require('@webcomponents/shadydom');
require('@webcomponents/shadycss');
require('template');

Object.assign(window, {
  rafIt(name, fn) {
    it(name, (done) => {
      requestAnimationFrame(() => {
        fn();
        requestAnimationFrame(done);
      });
    });
  },

  frafIt(name, fn) {
    fit(name, (done) => {
      requestAnimationFrame(() => {
        fn();
        requestAnimationFrame(done);
      });
    });
  },
});

const req = require.context('../packages', true, /^\.\/[a-z]+\/test\/(.*\.(js$))$/igm);
req.keys().forEach(key => req(key));

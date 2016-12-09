/* eslint-disable import/no-extraneous-dependencies, global-require */
require('core-js/shim');

if (!window.customElements) require('@webcomponents/custom-elements');
if (!document.body.attachShadow) require('@webcomponents/shadydom/src/env');

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

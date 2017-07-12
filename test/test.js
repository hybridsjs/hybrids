import define from '../src/define';
import { COMPONENT } from '../src/symbols';

function randomName() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
}

global.getElement = (el, id) => el.shadowRoot.getElementById(id);
global.getComponent = (el, id) => global.getElement(el, id)[COMPONENT];

global.test = function test(Component, tests) {
  const tagName = `${randomName()}-${randomName()}`;
  define({ [tagName]: Component });

  Object.entries(tests).forEach(([name, fn]) => {
    it(`- ${name}`, (done) => {
      const el = document.createElement(tagName);
      document.body.appendChild(el);

      global.requestAnimationFrame(() => {
        const callback = fn(el, el[COMPONENT]);

        global.requestAnimationFrame(() => {
          if (callback) {
            callback(() => {
              done();
              if (el.parentElement) el.parentElement.removeChild(el);
            });
          } else {
            done();
          }

          if (el.parentElement) el.parentElement.removeChild(el);
        });
      });
    });
  });
};

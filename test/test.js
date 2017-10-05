import define from '../src/define';
import { COMPONENT } from '../src/symbols';

function randomName() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
}

global.hybrid = function hybrid(Component) {
  const tagName = `${randomName()}-${randomName()}`;
  define({ [tagName]: Component });

  return test => (done) => {
    const el = document.createElement(tagName);
    document.body.appendChild(el);

    const clearDone = () => {
      done();
      if (el.parentElement) el.parentElement.removeChild(el);
    };

    Promise.resolve().then(() => {
      global.requestAnimationFrame(() => {
        const callback = test({
          el,
          component: el[COMPONENT],
          getElement: id => el.shadowRoot.getElementById(id),
          getComponent: id => el.shadowRoot.getElementById(id)[COMPONENT],
        });

        if (callback) {
          Promise.resolve().then(() => {
            global.requestAnimationFrame(() => {
              callback(clearDone);
            });
          }).catch(() => {});
        } else {
          clearDone();
        }
      });
    }).catch(() => {});
  };
};

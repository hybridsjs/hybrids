import 'core-js/shim';
import '../shim';

// Set dynamic env variable
window.env = 'development';

// Set IS_IE to true for testing hacks for support style attribute on IE
if (!('ActiveXObject' in window)) {
  window.ActiveXObject = {};
}

window.test = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;

  return (spec) => {
    const wrapper = document.createElement('div');
    document.body.appendChild(wrapper);

    wrapper.appendChild(document.importNode(template.content, true));
    const promise = spec(wrapper.children[0]);

    if (promise) {
      promise.then(() => document.body.removeChild(wrapper));
    } else {
      document.body.removeChild(wrapper);
    }
  };
};

const req = require.context('./spec/', true, /\.js$/);
req.keys().forEach(key => req(key));

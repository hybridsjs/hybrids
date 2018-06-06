import '../shim';

// Set dynamic env variable
window.env = 'development';

window.test = (html) => {
  const template = document.createElement('template');
  template.innerHTML = html;

  return (spec) => {
    const wrapper = document.createElement('div');
    document.body.appendChild(wrapper);

    wrapper.appendChild(template.content.cloneNode(true));
    const promise = spec(wrapper.children[0]);

    Promise.resolve(promise).then(() => {
      document.body.removeChild(wrapper);
    });
  };
};

const req = require.context('./spec/', true, /\.js$/);
req.keys().forEach(key => req(key));

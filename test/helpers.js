export function test(html) {
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
}

export function resolveRaf(fn) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        Promise.resolve()
          .then(fn)
          .then(resolve);
      });
    });
  });
}

export function resolveTimeout(fn) {
  return new Promise((resolve) => {
    setTimeout(() => {
      Promise.resolve()
        .then(fn)
        .then(resolve);
    }, 250);
  });
}

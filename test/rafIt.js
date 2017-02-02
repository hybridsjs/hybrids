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

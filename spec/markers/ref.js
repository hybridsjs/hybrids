describe('Ref Marker', () => {
  test(class {
    static component = {
      template: `
        <div id="one" ref:="div"></div>
      `,
    }

    constructor() {
      this.div = null;
    }
  }, {
    'sets element ref': (el, component) => {
      expect(component.div).toEqual(getElement(el, 'one'));
    },
  });
});

describe('Ref Marker:', () => {
  const test = hybrid(class {
    static view = {
      template: `
        <div id="one" ref:="div"></div>
      `,
    }

    constructor() {
      this.div = null;
    }
  });

  it('sets element ref', test(({ component, getElement }) => {
    expect(component.div).toEqual(getElement('one'));
  }));
});

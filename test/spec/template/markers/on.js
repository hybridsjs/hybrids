describe('Marker On:', () => {
  const test = hybrid(class {
    static view = {
      template: `
        <template for:="items">
          <div id="one" on:click="click"></div>
        </template>
      `,
    }

    constructor() {
      this.items = [0];
    }

    // eslint-disable-next-line
    click() {}
  });

  it('calls event handler with merged context', test(({ component, getElement }) => {
    const spy = spyOn(component, 'click');
    const one = getElement('one');
    one.click();

    expect(spy).toHaveBeenCalled();

    const { args } = spy.calls.mostRecent();
    expect(args[0]).toEqual(jasmine.objectContaining({ item: 0 }));
    expect(args[1] instanceof Event).toBe(true);
  }));
});

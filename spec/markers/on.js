describe('Marker On', () => {
  test(class {
    static component = {
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
  }, {
    'calls event handler with merged context': (el, component) => {
      const spy = spyOn(component, 'click');
      const one = getElement(el, 'one');
      one.click();

      expect(spy).toHaveBeenCalled();

      const { args } = spy.calls.mostRecent();
      expect(args[0]).toEqual(jasmine.objectContaining({ item: 0 }));
      expect(args[1] instanceof Event).toBe(true);
    },
  });
});

describe('Marker If', () => {
  test(class {
    static component = {
      template: `
        <template if:="show">
          <div *for:="items">{{ item }}</div>
        </template>
      `,
    }

    constructor() {
      this.show = true;
      this.items = ['4', '2', '3', '1'];
    }
  }, {
    'renders elements': (el) => {
      expect(el.shadowRoot.children.length).toBe(4);
    },
    'removes elements': (el, component) => {
      component.show = false;

      return (done) => {
        expect(el.shadowRoot.children.length).toBe(0);
        done();
      };
    },
    'rerender removed nested elements': (el, component) => {
      component.show = false;
      return (done) => {
        component.show = true;
        requestAnimationFrame(() => {
          expect(el.shadowRoot.children.length).toBe(4);
          done();
        });
      };
    },
  });
});

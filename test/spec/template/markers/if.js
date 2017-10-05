describe('Marker If:', () => {
  const test = hybrid(class {
    static view = {
      template: `
        <template if:="store.show">
          <div *for:="store.items">{{ item }}</div>
        </template>
      `,
    }

    constructor() {
      this.store = {
        show: true,
        items: ['4', '2', '3', '1'],
      };
    }
  });

  it('renders elements', test(({ el }) => {
    expect(el.shadowRoot.children.length).toBe(4);
  }));

  it('removes elements', test(({ el, component }) => {
    component.store.show = false;

    return (done) => {
      expect(el.shadowRoot.children.length).toBe(0);
      done();
    };
  }));

  it('re-render removed nested elements', test(({ el, component }) => {
    component.store.show = false;
    return (done) => {
      component.store.show = true;
      Promise.resolve().then(() => {
        requestAnimationFrame(() => {
          expect(el.shadowRoot.children.length).toBe(4);
          done();
        });
      });
    };
  }));
});

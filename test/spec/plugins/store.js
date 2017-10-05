import store from '../../../src/plugins/store';

describe('Plugin Store:', () => {
  function extractValues(el) {
    return Array.from(el.shadowRoot.querySelectorAll('[data-value]')).map(
      node => node.value,
    );
  }

  const globalStore = {
    items: [],
  };

  class WithStore {
    static properties = {
      store: store(globalStore),
    }

    static view = {
      template: `
        <div *for:item="store.items" prop:value="item" data-value></div>
      `,
    }
  }

  const test = hybrid(class {
    static view = {
      define: { WithStore },
      template: `
        <with-store id="one"></with-store>
        <with-store id="two"></with-store>
      `,
    }
  });

  beforeEach(() => {
    globalStore.items = [1, 2];
  });

  it('set initial values', test(({ getElement }) => {
    expect(extractValues(getElement('one'))).toEqual([1, 2]);
    expect(extractValues(getElement('two'))).toEqual([1, 2]);
  }));

  it('store property update', test(({ getElement }) => {
    globalStore.items.push(3);

    return (done) => {
      expect(extractValues(getElement('one'))).toEqual([1, 2, 3]);
      expect(extractValues(getElement('two'))).toEqual([1, 2, 3]);
      done();
    };
  }));

  it('store property replace', test(({ getElement }) => {
    globalStore.items = [3, 4, 5];

    return (done) => {
      expect(extractValues(getElement('one'))).toEqual([3, 4, 5]);
      expect(extractValues(getElement('two'))).toEqual([3, 4, 5]);
      done();
    };
  }));

  it('store property replace with the same value', test(({ getElement }) => {
    globalStore.items = globalStore.items;

    return (done) => {
      expect(extractValues(getElement('one'))).toEqual([1, 2]);
      expect(extractValues(getElement('two'))).toEqual([1, 2]);
      done();
    };
  }));
});

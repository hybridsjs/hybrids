import { createStore, getStore } from '../../../src/bindings/store';
import { COMPONENT } from '../../../src/symbols';

describe('Store binding', () => {
  class Store {
    constructor() {
      this.value = 'test';
    }

    delayUpdate() {
      setTimeout(() => {
        this.value = 'new value';
      }, 0);
    }
  }

  class OtherStore {}

  class StoreProvider {
    static component = {
      bindings: {
        store: createStore(Store),
        ownStore: createStore(),
      },
    };

    constructor() {
      this.ownStore = [];
    }

    // eslint-disable-next-line
    changed() {}
  }

  class StoreReceiver {
    static component = {
      bindings: {
        store: getStore(Store),
        otherStore: getStore(OtherStore),
      },
    };

    // eslint-disable-next-line
    changed() {}
  }

  class StoreBinding {
    static component = {
      define: { StoreProvider, StoreReceiver },
      template: `
        <store-provider id="provider">
          <div>
            <store-receiver id="receiver"></store-receiver>
          </div>
        </store-provider>
      `,
    }
  }

  describe('`createStore`', () => {
    test(StoreProvider, {
      'creates store': (el, component) => {
        expect(component.store instanceof Store).toBe(true);
      },
      'uses internal store': (el, component) => {
        expect(Array.isArray(component.ownStore)).toBe(true);
      },
      'async store update renders component': (el, component) => {
        const spy = spyOn(component, 'changed');
        component.store.delayUpdate();

        return (done) => {
          setTimeout(() => {
            expect(spy).toHaveBeenCalled();
            done();
          }, 0);
        };
      },
    });
  });

  describe('`getStore`', () => {
    const getElement = (el, id) => el.shadowRoot.getElementById(id);
    const getComponent = (el, id) => getElement(el, id)[COMPONENT];

    test(StoreBinding, {
      'connects to parent store': (el) => {
        const receiver = getComponent(el, 'receiver');
        expect(receiver.store instanceof Store).toBe(true);
      },
      'disconnects from parent store': (el) => {
        const receiverEl = getElement(el, 'receiver');
        const receiver = receiverEl[COMPONENT];
        const provider = getComponent(el, 'provider');
        const providerSpy = spyOn(provider, 'changed');

        receiverEl.parentElement.removeChild(receiverEl);

        return (done) => {
          expect(receiver.store).toBe(null);
          const receiverSpy = spyOn(receiver, 'changed');
          global.requestAnimationFrame(() => {
            provider.store.value = 'new value';
            global.requestAnimationFrame(() => {
              expect(providerSpy).toHaveBeenCalled();
              expect(receiverSpy).not.toHaveBeenCalled();
              done();
            });
          });
        };
      },
      'set not found store to null': (el) => {
        const receiver = getComponent(el, 'receiver');
        expect(receiver.otherStore).toBe(null);
      },
      'async store update renders provider component': (el) => {
        const receiver = getComponent(el, 'receiver');
        const provider = getComponent(el, 'provider');
        const spy = spyOn(provider, 'changed');

        receiver.store.delayUpdate();

        return (done) => {
          setTimeout(() => {
            expect(spy).toHaveBeenCalled();
            done();
          }, 0);
        };
      },
      'async store update renders receiver component': (el) => {
        const receiver = getComponent(el, 'receiver');
        const provider = getComponent(el, 'provider');
        const spy = spyOn(receiver, 'changed');

        provider.store.delayUpdate();

        return (done) => {
          setTimeout(() => {
            expect(spy).toHaveBeenCalled();
            done();
          }, 0);
        };
      },
    });
  });
});

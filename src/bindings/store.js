import { Observer } from 'papillon';
import { OBSERVER } from '../symbols';

const symbols = new WeakMap();

export const createStore = Store => key => (host, component) => {
  const store = Store ? new Store() : component[key];

  if (Store) {
    component[key] = store;

    const observer = new Observer(store, Object.keys(store), () => {
      host[OBSERVER].check();
    });

    let symbol = symbols.get(Store);
    if (!symbol) {
      symbol = Symbol(Store.name);
      symbols.set(Store, symbol);
    }

    Object.defineProperty(host, symbol, {
      value: {
        store,
        key,
        observer,
      },
    });
  }
};

export const getStore = Store => key => (host, component) => {
  let storeHost;
  let storeKey;

  const check = ({ target, detail: changelog }) => {
    if (target === storeHost && changelog[storeKey]) {
      host[OBSERVER].check();
    }
  };

  host.addEventListener('@connect', () => {
    const symbol = symbols.get(Store);
    if (symbol) {
      let el = host.parentElement;
      while (el) {
        if (el[symbol]) {
          storeHost = el;
          storeKey = el[symbol].key;
          component[key] = el[symbol].store;

          storeHost.addEventListener('@change', check);
          return;
        }
        el = el.parentElement;
      }
    }

    component[key] = null;
  });

  host.addEventListener('@disconnect', () => {
    component[key] = null;
    if (storeHost) {
      storeHost.removeEventListener('@change', check);
      storeHost = null;
    }
  });

  host.addEventListener('@change', ({ target, detail: changelog }) => {
    if (target === host && storeHost && changelog[key]) {
      storeHost[OBSERVER].check();
    }
  });
};

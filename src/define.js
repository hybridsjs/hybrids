import * as cache from "./cache.js";
import * as emitter from "./emitter.js";
import { deferred, camelToDash, walkInShadow } from "./utils.js";

import render from "./render.js";
import value from "./value.js";

export const constructors = new WeakMap();

const disconnects = new WeakMap();
function compile(hybrids, HybridsElement) {
  if (HybridsElement) {
    const prevHybrids = constructors.get(HybridsElement);
    if (hybrids === prevHybrids) return HybridsElement;

    for (const key of Object.keys(prevHybrids)) {
      if (key === "tag") continue;
      delete HybridsElement.prototype[key];
    }
  } else {
    HybridsElement = class extends globalThis.HTMLElement {
      constructor() {
        super();

        for (const [key, attrName] of HybridsElement.writable.entries()) {
          if (hasOwnProperty.call(this, key)) {
            const value = this[key];
            delete this[key];
            this[key] = value;
          } else {
            if (this.hasAttribute(attrName)) {
              const value = this.getAttribute(attrName);
              this[key] =
                (value === "" && typeof this[key] === "boolean") || value;
            }
          }
        }
      }

      connectedCallback() {
        const set = new Set();
        disconnects.set(this, set);

        emitter.add(() => {
          if (set === disconnects.get(this)) {
            for (const fn of HybridsElement.connects) set.add(fn(this));
            for (const fn of HybridsElement.observers) set.add(fn(this));
          }
        });
      }

      disconnectedCallback() {
        const callbacks = disconnects.get(this);

        for (const fn of callbacks) {
          if (fn) fn();
        }

        disconnects.delete(this);
        cache.invalidateAll(this);
      }
    };
  }

  constructors.set(HybridsElement, Object.freeze(hybrids));

  const connects = new Set();
  const observers = new Set();
  const writableProps = new Map();

  for (const key of Object.keys(hybrids)) {
    if (key === "tag") continue;

    let desc = hybrids[key];

    if (typeof desc !== "object" || desc === null) {
      desc = { value: desc };
    }

    if (desc.get || desc.set) {
      throw TypeError(`'get' and 'set' have been replaced with 'value' option`);
    }

    desc =
      key === "render" || key === "content"
        ? render(key, desc)
        : value(key, desc);

    if (desc.writable) {
      writableProps.set(key, camelToDash(key));
    }

    Object.defineProperty(HybridsElement.prototype, key, {
      get: desc.writable
        ? function get() {
            return cache.get(this, key, desc.value);
          }
        : function get() {
            return cache.get(this, key, (host) => desc.value(host));
          },
      set: desc.writable
        ? function assert(newValue) {
            cache.assert(this, key, newValue);
          }
        : undefined,
      enumerable: true,
      configurable: true,
    });

    if (desc.connect) {
      connects.add((host) =>
        desc.connect(host, key, () => {
          cache.invalidate(host, key);
        }),
      );
    }

    if (desc.observe) {
      observers.add((host) =>
        cache.observe(host, key, desc.value, desc.observe),
      );
    }
  }

  HybridsElement.connects = connects;
  HybridsElement.observers = observers;
  HybridsElement.writable = writableProps;

  return HybridsElement;
}

const updateQueue = new Map();
function update(HybridsElement) {
  if (!updateQueue.size) {
    deferred.then(() => {
      walkInShadow(globalThis.document.body, (node) => {
        if (updateQueue.has(node.constructor)) {
          const prevHybrids = updateQueue.get(node.constructor);
          const hybrids = constructors.get(node.constructor);
          node.disconnectedCallback();

          for (const key of Object.keys(hybrids)) {
            const type = typeof hybrids[key];
            const clearValue =
              type !== "object" &&
              type !== "function" &&
              hybrids[key] !== prevHybrids[key];

            if (clearValue) node.removeAttribute(camelToDash(key));
            cache.invalidate(node, key, { clearValue });
          }

          node.connectedCallback();
        }
      });
      updateQueue.clear();
    });
  }
  updateQueue.set(HybridsElement, constructors.get(HybridsElement));
}

function define(hybrids) {
  if (!hybrids.tag) {
    throw TypeError(
      "Error while defining an element: 'tag' property with dashed tag name is required",
    );
  }

  try {
    const HybridsElement = globalThis.customElements.get(hybrids.tag);

    if (HybridsElement) {
      if (constructors.get(HybridsElement)) {
        update(HybridsElement);
        compile(hybrids, HybridsElement);

        return hybrids;
      }

      throw TypeError(
        `Custom element with '${hybrids.tag}' tag name already defined outside of the hybrids context`,
      );
    }

    globalThis.customElements.define(hybrids.tag, compile(hybrids));
  } catch (e) {
    console.error(`Error while defining '${hybrids.tag}' element:`);
    throw e;
  }

  return hybrids;
}

function from(components, { root = "", prefix } = {}) {
  for (const key of Object.keys(components)) {
    const hybrids = components[key];

    if (!hybrids.tag) {
      const tag = camelToDash(
        []
          .concat(root)
          .reduce((acc, root) => acc.replace(root, ""), key)
          .replace(/^[./]+/, "")
          .replace(/\//g, "-")
          .replace(/\.[a-zA-Z]+$/, ""),
      );

      hybrids.tag = prefix ? `${prefix}-${tag}` : tag;
    }

    define(hybrids);
  }

  return components;
}

export default Object.freeze(
  Object.assign(define, {
    compile: (hybrids) => compile(hybrids),
    from,
  }),
);

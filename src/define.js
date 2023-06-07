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
      delete HybridsElement.prototype[key];
    }
  } else {
    HybridsElement = class extends globalThis.HTMLElement {
      connectedCallback() {
        for (const key of HybridsElement.settable) {
          if (!hasOwnProperty.call(this, key)) continue;

          const value = this[key];
          delete this[key];
          this[key] = value;
        }

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
  const settable = new Set();

  for (const key of Object.keys(hybrids)) {
    if (key === "tag") continue;

    let desc = hybrids[key];
    const type = typeof desc;

    if (type === "function") {
      if (key === "render") {
        desc = render(desc, true);
      } else if (key === "content") {
        desc = render(desc);
      } else {
        desc = { get: desc };
      }
    } else if (type !== "object" || desc === null) {
      desc = { value: desc };
    } else if (desc.set) {
      if (hasOwnProperty.call(desc, "value")) {
        throw TypeError(
          `Invalid property descriptor for '${key}' property - it must not have 'value' and 'set' properties at the same time.`,
        );
      }

      const attrName = camelToDash(key);
      const get = desc.get || ((host, value) => value);
      desc.get = (host, value) => {
        if (value === undefined) {
          value = desc.set(host, host.getAttribute(attrName) || value);
        }
        return get(host, value);
      };
    }

    if (hasOwnProperty.call(desc, "value")) {
      desc = value(key, desc);
    } else if (!desc.get) {
      throw TypeError(
        `Invalid descriptor for '${key}' property - it must contain 'value' or 'get' option`,
      );
    }

    if (desc.set) settable.add(key);

    Object.defineProperty(HybridsElement.prototype, key, {
      get: function get() {
        return cache.get(this, key, desc.get);
      },
      set:
        desc.set &&
        function set(newValue) {
          cache.set(this, key, desc.set, newValue);
        },
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
      observers.add((host) => cache.observe(host, key, desc.get, desc.observe));
    }
  }

  HybridsElement.connects = connects;
  HybridsElement.observers = observers;
  HybridsElement.settable = settable;

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
      "Error while defining hybrids: 'tag' property with dashed tag name is required",
    );
  }

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
  return hybrids;
}

function from(components, options = {}) {
  const { root = "", prefix } = options;
  const keys = Object.keys(components);

  if (keys.length === 0) return components;

  for (const key of keys) {
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

import global from "./global.js";
import * as cache from "./cache.js";
import * as emitter from "./emitter.js";
import { deferred, camelToDash, walkInShadow } from "./utils.js";

import render from "./render.js";
import value from "./value.js";

const disconnects = new WeakMap();
function compile(hybrids, HybridsElement) {
  if (HybridsElement) {
    if (hybrids === HybridsElement.hybrids) return HybridsElement;

    for (const key of Object.keys(HybridsElement.hybrids)) {
      delete HybridsElement.prototype[key];
    }
  } else {
    HybridsElement = class extends global.HTMLElement {
      connectedCallback() {
        for (const key of Object.keys(this)) {
          const value = this[key];
          delete this[key];
          this[key] = value;
        }

        const set = new Set();
        disconnects.set(this, set);

        emitter.add(() => {
          if (set === disconnects.get(this)) {
            for (const fn of this.constructor.connects) set.add(fn(this));
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

  HybridsElement.hybrids = hybrids;

  const connects = new Set();

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
      connects.add((host) => cache.observe(host, key, desc.get, desc.observe));
    }
  }

  HybridsElement.connects = connects;

  return HybridsElement;
}

const updateQueue = new Map();
function update(HybridsElement) {
  if (!updateQueue.size) {
    deferred.then(() => {
      walkInShadow(global.document.body, (node) => {
        if (updateQueue.has(node.constructor)) {
          const prevHybrids = updateQueue.get(node.constructor);
          const hybrids = node.constructor.hybrids;
          node.disconnectedCallback();

          for (const key of Object.keys(hybrids)) {
            const type = typeof hybrids[key];
            const clearValue =
              type !== "object" &&
              type !== "function" &&
              hybrids[key] !== prevHybrids[key];
            cache.invalidate(node, key, { clearValue });
          }

          node.connectedCallback();
        }
      });
      updateQueue.clear();
    });
  }
  updateQueue.set(HybridsElement, HybridsElement.hybrids);
}

function define(hybrids) {
  if (!hybrids.tag) {
    throw TypeError(
      "Error while defining hybrids: 'tag' property with dashed tag name is required",
    );
  }

  const HybridsElement = global.customElements.get(hybrids.tag);

  if (HybridsElement) {
    if (HybridsElement.hybrids) {
      update(HybridsElement);
      compile(hybrids, HybridsElement);

      return Object.freeze(hybrids);
    }

    throw TypeError(
      `Custom element with '${hybrids.tag}' tag name already defined outside of the hybrids context`,
    );
  }

  global.customElements.define(hybrids.tag, compile(hybrids));
  return Object.freeze(hybrids);
}

export default Object.freeze(
  Object.assign(define, { compile: (hybrids) => compile(hybrids) }),
);

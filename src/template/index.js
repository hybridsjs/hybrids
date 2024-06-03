import { compileTemplate } from "./core.js";
import { getPlaceholder } from "./utils.js";

import * as helpers from "./helpers/index.js";
import * as methods from "./methods.js";

const PLACEHOLDER = getPlaceholder();
const PLACEHOLDER_SVG = getPlaceholder("svg");

const templates = new Map();
export function compile(parts, args, id, isSVG, isMsg) {
  function fn(host, shadow, target) {
    id = id + fn.useLayout;

    let render = templates.get(id);
    if (!render) {
      render = compileTemplate(parts, isSVG, isMsg, fn.useLayout);
      templates.set(id, render);
    }

    if (target) {
      if (
        (render.useShadow || fn.styleSheets) &&
        shadow !== false &&
        !host.shadowRoot
      ) {
        throw TypeError(
          `Nested template with styles or <slot> element found - use options to explicitly define shadow DOM mode`,
        );
      }
    } else {
      if (shadow === undefined && (render.useShadow || fn.styleSheets)) {
        shadow = { mode: "open" };
      }
      target = host.shadowRoot || (shadow && host.attachShadow(shadow)) || host;
    }

    if (fn.plugins) {
      fn.plugins.reduce(
        (acc, plugin) => plugin(acc),
        () => render(host, target, args, fn.styleSheets, shadow),
      )(host, target);
    } else {
      render(host, target, args, fn.styleSheets, shadow);
    }

    return target;
  }

  return Object.assign(fn, methods);
}

export function html(parts, ...args) {
  const id = parts.join(PLACEHOLDER);
  return compile(parts, args, id, false, false);
}

export function svg(parts, ...args) {
  const id = parts.join(PLACEHOLDER) + PLACEHOLDER_SVG;
  return compile(parts, args, id, true, false);
}

Object.freeze(Object.assign(html, helpers));

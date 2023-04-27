import { compileTemplate } from "./core.js";
import { getPlaceholder } from "./utils.js";

import * as helpers from "./helpers/index.js";
import * as methods from "./methods.js";

const PLACEHOLDER = getPlaceholder();
const PLACEHOLDER_SVG = getPlaceholder("svg");
const PLACEHOLDER_MSG = getPlaceholder("msg");
const PLACEHOLDER_LAYOUT = getPlaceholder("layout");

const templates = new Map();
export function compile(parts, args, isSVG, isMsg) {
  function template(host, target = host) {
    let id = isMsg ? parts + PLACEHOLDER_MSG : parts.join(PLACEHOLDER);
    if (isSVG) id += PLACEHOLDER_SVG;
    const useLayout = template.useLayout;
    if (useLayout) id += PLACEHOLDER_LAYOUT;

    let render = templates.get(id);
    if (!render) {
      render = compileTemplate(parts, isSVG, isMsg, useLayout);
      templates.set(id, render);
    }

    if (template.plugins) {
      template.plugins.reduce(
        (acc, plugin) => plugin(acc),
        () => render(host, target, args, template),
      )(host, target);
    } else {
      render(host, target, args, template);
    }
  }

  return Object.assign(template, methods);
}

export function html(parts, ...args) {
  return compile(parts, args, false, false);
}

export function svg(parts, ...args) {
  return compile(parts, args, true, false);
}

Object.freeze(Object.assign(html, helpers));

import { compileTemplate } from "./core.js";
import { getPlaceholder } from "./utils.js";
import * as helpers from "./helpers.js";

const PLACEHOLDER = getPlaceholder();
const PLACEHOLDER_SVG = getPlaceholder("svg");
const PLACEHOLDER_MSG = getPlaceholder("msg");
const PLACEHOLDER_LAYOUT = getPlaceholder("layout");

const methods = {
  key(id) {
    this.id = id;
    return this;
  },
  style(...styles) {
    this.styleSheets = this.styleSheets || [];
    this.styleSheets.push(...styles);

    return this;
  },
  css(parts, ...args) {
    this.styleSheets = this.styleSheets || [];

    let result = parts[0];
    for (let index = 1; index < parts.length; index++) {
      result +=
        (args[index - 1] !== undefined ? args[index - 1] : "") + parts[index];
    }

    this.styleSheets.push(result);

    return this;
  },
};

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

    render(host, target, args, template.styleSheets);
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
Object.freeze(Object.assign(svg, helpers));

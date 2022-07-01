import { compileTemplate } from "./core.js";
import { getPlaceholder } from "./utils.js";
import * as helpers from "./helpers.js";

const PLACEHOLDER = getPlaceholder();

const styleMap = new WeakMap();

const methods = {
  key(id) {
    this.id = id;
    return this;
  },
  style(...styles) {
    let list = styleMap.get(this);
    if (!list) styleMap.set(this, (list = []));

    styles.forEach((style) => {
      if (style) list.push(style);
    });

    return this;
  },
  css(parts, ...args) {
    let set = styleMap.get(this);
    if (!set) styleMap.set(this, (set = []));

    set.push(
      parts.reduce(
        (acc, part, index) =>
          `${acc}${part}${args[index] !== undefined ? args[index] : ""}`,
        "",
      ),
    );

    return this;
  },
};

const htmlTemplates = new Map();
export function html(parts, ...args) {
  function compile(host, target = host) {
    let id = parts.join(PLACEHOLDER);

    let render = htmlTemplates.get(id);
    if (!render) {
      render = compileTemplate(parts);
      htmlTemplates.set(id, render);
    }

    render(host, target, args, styleMap.get(compile));
  }

  return Object.assign(compile, methods);
}

const svgTemplates = new Map();
export function svg(parts, ...args) {
  function compile(host, target = host) {
    let id = parts.join(PLACEHOLDER);

    let render = svgTemplates.get(id);
    if (!render) {
      render = compileTemplate(parts, true);
      svgTemplates.set(id, render);
    }

    render(host, target, args, styleMap.get(compile));
  }

  return Object.assign(compile, methods);
}

Object.freeze(Object.assign(html, helpers));
Object.freeze(Object.assign(svg, helpers));

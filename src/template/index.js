import defineElements from "../define.js";

import { compileTemplate, getPlaceholder } from "./core.js";
import * as helpers from "./helpers.js";

const PLACEHOLDER = getPlaceholder();
const SVG_PLACEHOLDER = getPlaceholder("svg");
const STYLE_IMPORT_REGEXP = /@import/;

const templatesMap = new Map();
const stylesMap = new WeakMap();

const methods = {
  define(...elements) {
    defineElements(...elements);
    return this;
  },
  key(id) {
    this.id = id;
    return this;
  },
  style(...styles) {
    stylesMap.set(
      this,
      (stylesMap.get(this) || []).concat(styles.filter(style => style)),
    );
    return this;
  },
  css(parts, ...args) {
    stylesMap.set(
      this,
      (stylesMap.get(this) || []).concat(
        parts.reduce(
          (acc, part, index) => `${acc}${part}${args[index] || ""}`,
          "",
        ),
      ),
    );
    return this;
  },
};

function create(parts, args, isSVG) {
  const createTemplate = (host, target = host) => {
    const styles = stylesMap.get(createTemplate);
    let hasAdoptedStyleSheets;
    let id = parts.join(PLACEHOLDER);

    if (styles) {
      const joinedStyles = styles.join(PLACEHOLDER);
      hasAdoptedStyleSheets =
        !!target.adoptedStyleSheets && !STYLE_IMPORT_REGEXP.test(joinedStyles);
      if (!hasAdoptedStyleSheets) id += joinedStyles;
    }

    if (isSVG) id += SVG_PLACEHOLDER;

    let render = templatesMap.get(id);
    if (!render) {
      render = compileTemplate(parts, isSVG, !hasAdoptedStyleSheets && styles);
      templatesMap.set(id, render);
    }

    render(host, target, args, hasAdoptedStyleSheets && styles);
  };

  return Object.assign(createTemplate, methods);
}

export function html(parts, ...args) {
  return create(parts, args);
}

export function svg(parts, ...args) {
  return create(parts, args, true);
}

Object.assign(html, helpers);
Object.assign(svg, helpers);

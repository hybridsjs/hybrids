import defineElements from "../define.js";

import { compileTemplate, getPlaceholder } from "./core.js";
import * as helpers from "./helpers.js";
import { camelToDash } from "../utils.js";

const PLACEHOLDER = getPlaceholder();
const SVG_PLACEHOLDER = getPlaceholder("svg");
const STYLE_IMPORT_REGEXP = /@import/;

const templatesMap = new Map();
const stylesMap = new WeakMap();
const scopeMap = new WeakMap();
const scopeNames = new WeakMap();

let scopeCounter = 1;

const methods = {
  define(elements) {
    defineElements(elements);
    return this;
  },
  scope(elements) {
    scopeMap.set(
      this,
      Object.keys(elements).map(key => {
        let name = scopeNames.get(elements[key]);
        if (!name) {
          const rawName = camelToDash(key);
          // eslint-disable-next-line no-plusplus
          const finalName = `${rawName}-${scopeCounter++}`;
          defineElements({ [finalName]: elements[key] });
          name = { rawName, finalName };
        }

        return name;
      }),
    );
    return this;
  },
  key(id) {
    this.id = id;
    return this;
  },
  style(...styles) {
    stylesMap.set(
      this,
      styles.filter(style => style),
    );
    return this;
  },
};

function create(parts, args, isSVG) {
  const createTemplate = (host, target = host) => {
    const styles = stylesMap.get(createTemplate);
    let hasAdoptedStyleSheets;
    let id = parts.join(PLACEHOLDER);

    const scopedElements = scopeMap.get(createTemplate);

    if (scopedElements) {
      scopedElements.forEach(({ rawName, finalName }) => {
        id += `${rawName}-${finalName}`;
      });
    }

    if (styles) {
      const joinedStyles = styles.join(PLACEHOLDER);
      hasAdoptedStyleSheets =
        !!target.adoptedStyleSheets && !STYLE_IMPORT_REGEXP.test(joinedStyles);
      if (!hasAdoptedStyleSheets) id += joinedStyles;
    }

    if (isSVG) id += SVG_PLACEHOLDER;

    let render = templatesMap.get(id);
    if (!render) {
      render = compileTemplate(
        parts,
        isSVG,
        !hasAdoptedStyleSheets && styles,
        scopedElements,
      );
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

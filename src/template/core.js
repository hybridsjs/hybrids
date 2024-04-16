import { stringifyElement, probablyDevMode } from "../utils.js";
import { get as getMessage, isLocalizeEnabled } from "../localize.js";

import * as layout from "./layout.js";
import {
  getMeta,
  getPlaceholder,
  getTemplateEnd,
  removeTemplate,
} from "./utils.js";

import resolveValue from "./resolvers/value.js";
import resolveProperty from "./resolvers/property.js";

const PLACEHOLDER_REGEXP_TEXT = getPlaceholder("(\\d+)");
const PLACEHOLDER_REGEXP_EQUAL = new RegExp(`^${PLACEHOLDER_REGEXP_TEXT}$`);
const PLACEHOLDER_REGEXP_ALL = new RegExp(PLACEHOLDER_REGEXP_TEXT, "g");
const PLACEHOLDER_REGEXP_ONLY = /^[^A-Za-z]+$/;

function createSignature(parts) {
  let signature = parts[0];
  let tableMode = false;
  for (let index = 1; index < parts.length; index += 1) {
    tableMode =
      tableMode ||
      signature.match(
        /<\s*(table|th|tr|td|thead|tbody|tfoot|caption|colgroup)([^<>]|"[^"]*"|'[^']*')*>\s*$/,
      );

    signature +=
      (tableMode
        ? `<!--${getPlaceholder(index - 1)}-->`
        : getPlaceholder(index - 1)) + parts[index];

    tableMode =
      tableMode &&
      !signature.match(
        /<\/\s*(table|th|tr|td|thead|tbody|tfoot|caption|colgroup)\s*>/,
      );
  }

  return signature;
}

function getPropertyName(string) {
  return string
    .replace(/\s*=\s*['"]*$/g, "")
    .split(/\s+/)
    .pop();
}

function createWalker(context) {
  return globalThis.document.createTreeWalker(
    context,
    globalThis.NodeFilter.SHOW_ELEMENT |
      globalThis.NodeFilter.SHOW_TEXT |
      globalThis.NodeFilter.SHOW_COMMENT,
    null,
    false,
  );
}

function normalizeWhitespace(input, startIndent = 0) {
  input = input.replace(/(^[\n\s\t ]+)|([\n\s\t ]+$)+/g, "");

  let i = input.indexOf("\n");
  if (i > -1) {
    let indent = 0 - startIndent - 2;
    for (i += 1; input[i] === " " && i < input.length; i += 1) {
      indent += 1;
    }
    return input.replace(/\n +/g, (t) =>
      t.substr(0, Math.max(t.length - indent, 1)),
    );
  }

  return input;
}

function beautifyTemplateLog(input, index) {
  const placeholder = getPlaceholder(index);

  const output = normalizeWhitespace(input)
    .split("\n")
    .filter((i) => i)
    .map((line) => {
      const startIndex = line.indexOf(placeholder);

      if (startIndex > -1) {
        return `| ${line}\n--${"-".repeat(startIndex)}${"^".repeat(6)}`;
      }

      return `| ${line}`;
    })
    .join("\n")
    .replace(PLACEHOLDER_REGEXP_ALL, "${...}");

  return `${output}`;
}

const styleSheetsMap = new Map();
const prevStylesMap = new WeakMap();
const prevStyleSheetsMap = new WeakMap();
function updateAdoptedStylesheets(target, styles) {
  const prevStyles = prevStylesMap.get(target);

  if (
    (!prevStyles && !styles) ||
    (styles?.length &&
      prevStyles?.length &&
      styles?.every((s, i) => prevStyles[i] === s))
  ) {
    return;
  }

  let styleSheets = null;
  if (styles) {
    styleSheets = [];
    for (const style of styles) {
      let styleSheet = style;
      if (!(styleSheet instanceof globalThis.CSSStyleSheet)) {
        styleSheet = styleSheetsMap.get(style);
        if (!styleSheet) {
          styleSheet = new globalThis.CSSStyleSheet();
          styleSheet.replaceSync(style);
          styleSheetsMap.set(style, styleSheet);
        }
      }
      styleSheets.push(styleSheet);
    }
  }

  let adoptedStyleSheets;
  const prevStyleSheets = prevStyleSheetsMap.get(target);

  if (prevStyleSheets) {
    adoptedStyleSheets = [];

    for (const styleSheet of target.adoptedStyleSheets) {
      if (!prevStyleSheets.includes(styleSheet)) {
        adoptedStyleSheets.push(styleSheet);
      }
    }
  }

  if (styleSheets) {
    adoptedStyleSheets =
      adoptedStyleSheets || target.adoptedStyleSheets.length
        ? [...target.adoptedStyleSheets]
        : [];

    for (const styleSheet of styleSheets) {
      adoptedStyleSheets.push(styleSheet);
    }
  }

  target.adoptedStyleSheets = adoptedStyleSheets;

  prevStylesMap.set(target, styles);
  prevStyleSheetsMap.set(target, styleSheets);
}

const styleElementMap = new WeakMap();
function updateStyleElement(target, styles) {
  let styleEl = styleElementMap.get(target);

  if (styles) {
    const prevStyles = prevStylesMap.get(target);
    if (prevStyles && styles.every((s, i) => prevStyles[i] === s)) return;

    if (!styleEl || styleEl.parentNode !== target) {
      styleEl = globalThis.document.createElement("style");
      styleElementMap.set(target, styleEl);

      target = getTemplateEnd(target);
      if (target.nodeType === globalThis.Node.TEXT_NODE) {
        target.parentNode.insertBefore(styleEl, target.nextSibling);
      } else {
        target.appendChild(styleEl);
      }
    }

    styleEl.textContent = styles.join("\n/*------*/\n");

    prevStylesMap.set(target, styles);
  } else if (styleEl) {
    styleEl.parentNode.removeChild(styleEl);
    styleElementMap.set(target, null);
  }
}

export function compileTemplate(rawParts, isSVG, isMsg, useLayout) {
  let template = globalThis.document.createElement("template");
  const parts = {};

  const signature = isMsg ? rawParts : createSignature(rawParts);

  template.innerHTML = isSVG ? `<svg>${signature}</svg>` : signature;

  if (isSVG) {
    const svgRoot = template.content.firstChild;
    template.content.removeChild(svgRoot);
    for (const node of Array.from(svgRoot.childNodes)) {
      template.content.appendChild(node);
    }
  }

  let hostLayout;
  const layoutTemplate = template.content.children[0];
  if (layoutTemplate instanceof globalThis.HTMLTemplateElement) {
    for (const attr of Array.from(layoutTemplate.attributes)) {
      const value = attr.value.trim();
      if (value && attr.name.startsWith("layout")) {
        if (value.match(PLACEHOLDER_REGEXP_ALL)) {
          throw Error("Layout attribute cannot contain expressions");
        }

        hostLayout = layout.insertRule(
          layoutTemplate,
          attr.name.substr(6),
          value,
          true,
        );
      }
    }

    if (hostLayout !== undefined && template.content.children.length > 1) {
      throw Error(
        "Template, which uses layout system must have only the '<template>' root element",
      );
    }

    useLayout = hostLayout || layoutTemplate.hasAttribute("layout");
    template = layoutTemplate;
  }

  const compileWalker = createWalker(template.content);
  const notDefinedElements = [];
  let compileIndex = 0;
  let noTranslate = null;

  while (compileWalker.nextNode()) {
    let node = compileWalker.currentNode;

    if (noTranslate && !noTranslate.contains(node)) {
      noTranslate = null;
    }

    if (node.nodeType === globalThis.Node.COMMENT_NODE) {
      if (PLACEHOLDER_REGEXP_EQUAL.test(node.textContent)) {
        node.parentNode.insertBefore(
          globalThis.document.createTextNode(node.textContent),
          node.nextSibling,
        );

        compileWalker.nextNode();
        node.parentNode.removeChild(node);
        node = compileWalker.currentNode;
      }
    }

    if (node.nodeType === globalThis.Node.TEXT_NODE) {
      let text = node.textContent;
      const equal = text.match(PLACEHOLDER_REGEXP_EQUAL);

      if (equal) {
        node.textContent = "";
        parts[equal[1]] = [compileIndex, resolveValue];
      } else {
        if (
          isLocalizeEnabled() &&
          !isMsg &&
          !noTranslate &&
          !text.match(/^\s*$/)
        ) {
          let offset;
          const key = text.trim();
          const localizedKey = key
            .replace(/\s+/g, " ")
            .replace(PLACEHOLDER_REGEXP_ALL, (_, index) => {
              index = Number(index);
              if (offset === undefined) offset = index;
              return `\${${index - offset}}`;
            });

          if (!localizedKey.match(PLACEHOLDER_REGEXP_ONLY)) {
            let context =
              node.previousSibling &&
              node.previousSibling.nodeType === globalThis.Node.COMMENT_NODE
                ? node.previousSibling
                : "";
            if (context) {
              context.parentNode.removeChild(context);
              compileIndex -= 1;
              context = (context.textContent.split("|")[1] || "")
                .trim()
                .replace(/\s+/g, " ");
            }

            const resultKey = getMessage(localizedKey, context).replace(
              /\${(\d+)}/g,
              (_, index) => getPlaceholder(Number(index) + offset),
            );

            text = text.replace(key, resultKey);
            node.textContent = text;
          }
        }

        const results = text.match(PLACEHOLDER_REGEXP_ALL);
        if (results) {
          let currentNode = node;
          results
            .reduce(
              (acc, placeholder) => {
                const [before, next] = acc.pop().split(placeholder);
                if (before) acc.push(before);
                acc.push(placeholder);
                if (next) acc.push(next);
                return acc;
              },
              [text],
            )
            .forEach((part, index) => {
              if (index === 0) {
                currentNode.textContent = part;
              } else {
                currentNode = currentNode.parentNode.insertBefore(
                  globalThis.document.createTextNode(part),
                  currentNode.nextSibling,
                );

                compileWalker.currentNode = currentNode;
                compileIndex += 1;
              }

              const equal = currentNode.textContent.match(
                PLACEHOLDER_REGEXP_EQUAL,
              );
              if (equal) {
                currentNode.textContent = "";
                parts[equal[1]] = [compileIndex, resolveValue];
              }
            });
        }
      }
    } else {
      /* istanbul ignore else */
      if (node.nodeType === globalThis.Node.ELEMENT_NODE) {
        if (
          !noTranslate &&
          (node.getAttribute("translate") === "no" ||
            node.tagName.toLowerCase() === "script" ||
            node.tagName.toLowerCase() === "style")
        ) {
          noTranslate = node;
        }

        /* istanbul ignore else */
        if (probablyDevMode) {
          const tagName = node.tagName.toLowerCase();
          if (
            tagName.match(/.+-.+/) &&
            !globalThis.customElements.get(tagName) &&
            !notDefinedElements.includes(tagName)
          ) {
            notDefinedElements.push(tagName);
          }
        }

        for (const attr of Array.from(node.attributes)) {
          const value = attr.value.trim();
          /* istanbul ignore next */
          const name = attr.name;

          if (useLayout && name.startsWith("layout") && value) {
            if (value.match(PLACEHOLDER_REGEXP_ALL)) {
              throw Error("Layout attribute cannot contain expressions");
            }

            const className = layout.insertRule(node, name.substr(6), value);
            node.removeAttribute(name);
            node.classList.add(className);

            continue;
          }

          const equal = value.match(PLACEHOLDER_REGEXP_EQUAL);
          if (equal) {
            const propertyName = getPropertyName(rawParts[equal[1]]);
            parts[equal[1]] = [
              compileIndex,
              resolveProperty(name, propertyName, isSVG),
            ];
            node.removeAttribute(attr.name);
          } else {
            const results = value.match(PLACEHOLDER_REGEXP_ALL);
            if (results) {
              const partialName = `attr__${name}`;

              for (const [index, placeholder] of results.entries()) {
                const [, id] = placeholder.match(PLACEHOLDER_REGEXP_EQUAL);
                let isProp = false;
                parts[id] = [
                  compileIndex,
                  (host, target, attrValue) => {
                    const meta = getMeta(target);
                    meta[partialName] = (meta[partialName] || value).replace(
                      placeholder,
                      attrValue == null ? "" : attrValue,
                    );

                    if (results.length === 1 || index + 1 === results.length) {
                      isProp =
                        isProp ||
                        (!isSVG &&
                          !(target instanceof globalThis.SVGElement) &&
                          name in target);
                      if (isProp) {
                        target[name] = meta[partialName];
                      } else {
                        target.setAttribute(name, meta[partialName]);
                      }
                      meta[partialName] = undefined;
                    }
                  },
                ];
              }

              attr.value = "";
            }
          }
        }
      }
    }

    compileIndex += 1;
  }

  if (probablyDevMode && notDefinedElements.length) {
    console.warn(
      `Not defined ${notDefinedElements
        .map((e) => `<${e}>`)
        .join(", ")} element${
        notDefinedElements.length > 1 ? "s" : ""
      } found in the template:\n${beautifyTemplateLog(signature, -1)}`,
    );
  }

  const partsKeys = Object.keys(parts);
  return function updateTemplateInstance(host, target, args, { styleSheets }) {
    let meta = getMeta(target);

    if (template !== meta.template) {
      const fragment = globalThis.document.importNode(template.content, true);
      const renderWalker = createWalker(fragment);
      const markers = [];

      let renderIndex = 0;
      let keyIndex = 0;
      let currentPart = parts[partsKeys[keyIndex]];

      while (renderWalker.nextNode()) {
        const node = renderWalker.currentNode;

        while (currentPart && currentPart[0] === renderIndex) {
          markers.push({
            index: partsKeys[keyIndex],
            node,
            fn: currentPart[1],
          });
          keyIndex += 1;
          currentPart = parts[partsKeys[keyIndex]];
        }

        renderIndex += 1;
      }

      if (meta.hostLayout) {
        host.classList.remove(meta.hostLayout);
      }

      removeTemplate(target);

      meta = getMeta(target);

      meta.template = template;
      meta.markers = markers;

      if (target.nodeType === globalThis.Node.TEXT_NODE) {
        updateStyleElement(target);

        meta.startNode = fragment.childNodes[0];
        meta.endNode = fragment.childNodes[fragment.childNodes.length - 1];

        let previousChild = target;

        let child = fragment.childNodes[0];
        while (child) {
          target.parentNode.insertBefore(child, previousChild.nextSibling);
          previousChild = child;
          child = fragment.childNodes[0];
        }
      } else {
        if (useLayout) {
          const className = `${hostLayout}-${host === target ? "c" : "s"}`;
          host.classList.add(className);
          meta.hostLayout = className;
        }

        target.appendChild(fragment);
      }

      if (useLayout) layout.inject(target);
    }

    if (target.adoptedStyleSheets) {
      updateAdoptedStylesheets(target, styleSheets);
    } else {
      updateStyleElement(target, styleSheets);
    }

    for (const marker of meta.markers) {
      const value = args[marker.index];
      const prevValue = meta.prevArgs && meta.prevArgs[marker.index];

      if (meta.prevArgs && value === prevValue) continue;

      try {
        marker.fn(host, marker.node, value, prevValue, useLayout);
      } catch (error) {
        console.error(
          `Error while updating template expression in ${stringifyElement(
            host,
          )}:\n${beautifyTemplateLog(signature, marker.index)}`,
        );

        throw error;
      }
    }

    meta.prevArgs = args;
  };
}

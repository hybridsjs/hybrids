import global from "../global.js";
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
      parts[index - 1].match(/<\s*(table|tr|thead|tbody|tfoot|colgroup)>\s*$/);

    signature +=
      (tableMode
        ? `<!--${getPlaceholder(index - 1)}-->`
        : getPlaceholder(index - 1)) + parts[index];

    tableMode =
      tableMode &&
      !parts[index].match(/<\/\s*(table|tr|thead|tbody|tfoot|colgroup)>/);
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
  return global.document.createTreeWalker(
    context,
    global.NodeFilter.SHOW_ELEMENT |
      global.NodeFilter.SHOW_TEXT |
      global.NodeFilter.SHOW_COMMENT,
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
function setupStyleUpdater(target) {
  if (target.adoptedStyleSheets) {
    let prevStyleSheets;
    return (styleSheets) => {
      const adoptedStyleSheets = target.adoptedStyleSheets;

      if (styleSheets) {
        styleSheets = styleSheets.map((style) => {
          let styleSheet = style;
          if (!(styleSheet instanceof global.CSSStyleSheet)) {
            styleSheet = styleSheetsMap.get(style);
            if (!styleSheet) {
              styleSheet = new global.CSSStyleSheet();
              styleSheet.replaceSync(style);
              styleSheetsMap.set(style, styleSheet);
            }
          }

          return styleSheet;
        });

        if (
          !prevStyleSheets ||
          prevStyleSheets.some((styleSheet, i) => styleSheet !== styleSheets[i])
        ) {
          // TODO: this might change order of already applied styles
          target.adoptedStyleSheets = (
            prevStyleSheets
              ? adoptedStyleSheets.filter(
                  (styleSheet) => !prevStyleSheets.includes(styleSheet),
                )
              : adoptedStyleSheets
          ).concat(styleSheets);
        }
      } else if (prevStyleSheets) {
        target.adoptedStyleSheets = adoptedStyleSheets.filter(
          (styleSheet) => !prevStyleSheets.includes(styleSheet),
        );
      }

      prevStyleSheets = styleSheets;
    };
  }

  let styleEl;
  return (styleSheets) => {
    if (styleSheets) {
      if (!styleEl) {
        styleEl = global.document.createElement("style");
        target = getTemplateEnd(target);
        if (target.nodeType === global.Node.TEXT_NODE) {
          target.parentNode.insertBefore(styleEl, target.nextSibling);
        } else {
          target.appendChild(styleEl);
        }
      }
      const result = [...styleSheets].join("\n/*------*/\n");

      if (styleEl.textContent !== result) {
        styleEl.textContent = result;
      }
    } else if (styleEl) {
      styleEl.parentNode.removeChild(styleEl);
      styleEl = null;
    }
  };
}

export function compileTemplate(rawParts, isSVG, isMsg, useLayout) {
  let template = global.document.createElement("template");
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
  if (layoutTemplate instanceof global.HTMLTemplateElement) {
    for (const attr of Array.from(layoutTemplate.attributes)) {
      const value = attr.value.trim();
      if (attr.name.startsWith("layout") && value) {
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

    useLayout = true;
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

    if (node.nodeType === global.Node.COMMENT_NODE) {
      if (PLACEHOLDER_REGEXP_EQUAL.test(node.textContent)) {
        node.parentNode.insertBefore(
          global.document.createTextNode(node.textContent),
          node.nextSibling,
        );

        compileWalker.nextNode();
        node.parentNode.removeChild(node);
        node = compileWalker.currentNode;
      }
    }

    if (node.nodeType === global.Node.TEXT_NODE) {
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
              node.previousSibling.nodeType === global.Node.COMMENT_NODE
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
                  global.document.createTextNode(part),
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
      if (node.nodeType === global.Node.ELEMENT_NODE) {
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
            !global.customElements.get(tagName) &&
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
                          !(target instanceof global.SVGElement) &&
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
  return function updateTemplateInstance(host, target, args, styles) {
    let meta = getMeta(target);

    if (template !== meta.template) {
      const fragment = global.document.importNode(template.content, true);
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
      meta.styles = setupStyleUpdater(target);

      if (target.nodeType === global.Node.TEXT_NODE) {
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

    meta.styles(styles);

    for (const marker of meta.markers) {
      const value = args[marker.index];
      const prevValue = meta.prevArgs && meta.prevArgs[marker.index];

      if (meta.prevArgs && value === prevValue) continue;

      try {
        marker.fn(host, marker.node, value, prevValue, useLayout);
      } catch (error) {
        console.error(
          `Following error was thrown when updating a template expression in ${stringifyElement(
            host,
          )}\n${beautifyTemplateLog(signature, marker.index)}`,
        );

        throw error;
      }
    }

    meta.prevArgs = args;
  };
}

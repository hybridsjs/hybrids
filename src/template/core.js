import { stringifyElement, shadyCSS, IS_IE } from "../utils.js";
import { dataMap, removeTemplate } from "./utils.js";

import resolveValue from "./resolvers/value.js";
import resolveProperty from "./resolvers/property.js";

/* istanbul ignore next */
try { process.env.NODE_ENV } catch(e) { var process = { env: { NODE_ENV: 'production' } }; } // eslint-disable-line

const TIMESTAMP = Date.now();

export const getPlaceholder = (id = 0) => `{{h-${TIMESTAMP}-${id}}}`;

const PLACEHOLDER_REGEXP_TEXT = getPlaceholder("(\\d+)");
const PLACEHOLDER_REGEXP_EQUAL = new RegExp(`^${PLACEHOLDER_REGEXP_TEXT}$`);
const PLACEHOLDER_REGEXP_ALL = new RegExp(PLACEHOLDER_REGEXP_TEXT, "g");

const ATTR_PREFIX = `--${TIMESTAMP}--`;
const ATTR_REGEXP = new RegExp(ATTR_PREFIX, "g");

const preparedTemplates = new WeakMap();

/* istanbul ignore next */
function applyShadyCSS(template, tagName) {
  if (!tagName) return template;

  return shadyCSS(shady => {
    let map = preparedTemplates.get(template);
    if (!map) {
      map = new Map();
      preparedTemplates.set(template, map);
    }

    let clone = map.get(tagName);

    if (!clone) {
      clone = document.createElement("template");
      clone.content.appendChild(template.content.cloneNode(true));

      map.set(tagName, clone);

      const styles = clone.content.querySelectorAll("style");

      Array.from(styles).forEach(style => {
        const count = style.childNodes.length + 1;
        for (let i = 0; i < count; i += 1) {
          style.parentNode.insertBefore(
            document.createTextNode(getPlaceholder()),
            style,
          );
        }
      });

      shady.prepareTemplate(clone, tagName.toLowerCase());
    }
    return clone;
  }, template);
}

function createSignature(parts, styles) {
  let signature = parts.reduce((acc, part, index) => {
    if (index === 0) {
      return part;
    }

    if (
      parts
        .slice(index)
        .join("")
        .match(/^\s*<\/\s*(table|tr|thead|tbody|tfoot|colgroup)>/)
    ) {
      return `${acc}<!--${getPlaceholder(index - 1)}-->${part}`;
    }
    return acc + getPlaceholder(index - 1) + part;
  }, "");

  if (styles) {
    signature += `<style>\n${styles.join("\n/*------*/\n")}\n</style>`;
  }

  /* istanbul ignore if */
  if (IS_IE) {
    return signature.replace(
      /style\s*=\s*(["][^"]+["]|['][^']+[']|[^\s"'<>/]+)/g,
      match => `${ATTR_PREFIX}${match}`,
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

function replaceComments(fragment) {
  const iterator = document.createNodeIterator(
    fragment,
    NodeFilter.SHOW_COMMENT,
    null,
    false,
  );
  let node;
  // eslint-disable-next-line no-cond-assign
  while ((node = iterator.nextNode())) {
    if (PLACEHOLDER_REGEXP_EQUAL.test(node.textContent)) {
      node.parentNode.insertBefore(
        document.createTextNode(node.textContent),
        node,
      );
      node.parentNode.removeChild(node);
    }
  }
}

export function createInternalWalker(context) {
  let node;

  return {
    get currentNode() {
      return node;
    },
    nextNode() {
      if (node === undefined) {
        node = context.childNodes[0];
      } else if (node.childNodes.length) {
        node = node.childNodes[0];
      } else if (node.nextSibling) {
        node = node.nextSibling;
      } else {
        let parentNode = node.parentNode;
        node = parentNode.nextSibling;

        while (!node && parentNode !== context) {
          parentNode = parentNode.parentNode;
          node = parentNode.nextSibling;
        }
      }

      return !!node;
    },
  };
}

function createExternalWalker(context) {
  return document.createTreeWalker(
    context,
    // eslint-disable-next-line no-bitwise
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null,
    false,
  );
}

/* istanbul ignore next */
const createWalker =
  typeof window.ShadyDOM === "object" && window.ShadyDOM.inUse
    ? createInternalWalker
    : createExternalWalker;

const container = document.createElement("div");
export function compileTemplate(rawParts, isSVG, styles) {
  const template = document.createElement("template");
  const parts = [];

  let signature = createSignature(rawParts, styles);
  if (isSVG) signature = `<svg>${signature}</svg>`;

  /* istanbul ignore if */
  if (IS_IE) {
    template.innerHTML = signature;
  } else {
    container.innerHTML = `<template>${signature}</template>`;
    template.content.appendChild(container.children[0].content);
  }

  if (isSVG) {
    const svgRoot = template.content.firstChild;
    template.content.removeChild(svgRoot);
    Array.from(svgRoot.childNodes).forEach(node =>
      template.content.appendChild(node),
    );
  }

  replaceComments(template.content);

  const compileWalker = createWalker(template.content);
  let compileIndex = 0;

  while (compileWalker.nextNode()) {
    const node = compileWalker.currentNode;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;

      if (!text.match(PLACEHOLDER_REGEXP_EQUAL)) {
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
                  document.createTextNode(part),
                  currentNode.nextSibling,
                );
              }
            });
        }
      }

      const equal = node.textContent.match(PLACEHOLDER_REGEXP_EQUAL);
      if (equal) {
        /* istanbul ignore else */
        if (!IS_IE) node.textContent = "";
        parts[equal[1]] = [compileIndex, resolveValue];
      }
    } else {
      /* istanbul ignore else */ // eslint-disable-next-line no-lonely-if
      if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.attributes).forEach(attr => {
          const value = attr.value.trim();
          /* istanbul ignore next */
          const name = IS_IE ? attr.name.replace(ATTR_PREFIX, "") : attr.name;
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

              results.forEach((placeholder, index) => {
                const [, id] = placeholder.match(PLACEHOLDER_REGEXP_EQUAL);
                parts[id] = [
                  compileIndex,
                  (host, target, attrValue) => {
                    const data = dataMap.get(target, {});
                    data[partialName] = (data[partialName] || value).replace(
                      placeholder,
                      attrValue == null ? "" : attrValue,
                    );

                    if (results.length === 1 || index + 1 === results.length) {
                      target.setAttribute(name, data[partialName]);
                      data[partialName] = undefined;
                    }
                  },
                ];
              });

              attr.value = "";

              /* istanbul ignore next */
              if (IS_IE && name !== attr.name) {
                node.removeAttribute(attr.name);
                node.setAttribute(name, "");
              }
            }
          }
        });
      }
    }

    compileIndex += 1;
  }

  return function updateTemplateInstance(host, target, args) {
    const data = dataMap.get(target, { type: "function" });

    if (template !== data.template) {
      if (data.template || target.nodeType === Node.ELEMENT_NODE)
        removeTemplate(target);
      data.prevArgs = null;

      const fragment = document.importNode(
        applyShadyCSS(template, host.tagName).content,
        true,
      );

      const renderWalker = createWalker(fragment);
      const clonedParts = parts.slice(0);

      let renderIndex = 0;
      let currentPart = clonedParts.shift();

      const markers = [];

      data.template = template;
      data.markers = markers;

      while (renderWalker.nextNode()) {
        const node = renderWalker.currentNode;

        if (node.nodeType === Node.TEXT_NODE) {
          /* istanbul ignore next */
          if (PLACEHOLDER_REGEXP_EQUAL.test(node.textContent)) {
            node.textContent = "";
          } else if (IS_IE) {
            node.textContent = node.textContent.replace(ATTR_REGEXP, "");
          }
        } else if (
          process.env.NODE_ENV !== "production" &&
          node.nodeType === Node.ELEMENT_NODE
        ) {
          if (
            node.tagName.indexOf("-") > -1 &&
            !customElements.get(node.tagName.toLowerCase())
          ) {
            throw Error(
              `Missing '${stringifyElement(
                node,
              )}' element definition in '${stringifyElement(host)}'`,
            );
          }
        }

        while (currentPart && currentPart[0] === renderIndex) {
          markers.push([node, currentPart[1]]);
          currentPart = clonedParts.shift();
        }

        renderIndex += 1;
      }

      if (target.nodeType === Node.TEXT_NODE) {
        data.startNode = fragment.childNodes[0];
        data.endNode = fragment.childNodes[fragment.childNodes.length - 1];

        let previousChild = target;

        let child = fragment.childNodes[0];
        while (child) {
          target.parentNode.insertBefore(child, previousChild.nextSibling);
          previousChild = child;
          child = fragment.childNodes[0];
        }
      } else {
        target.appendChild(fragment);
      }
    }

    const prevArgs = data.prevArgs;
    data.prevArgs = args;

    for (let index = 0; index < data.markers.length; index += 1) {
      const [node, marker] = data.markers[index];
      if (!prevArgs || prevArgs[index] !== args[index]) {
        marker(host, node, args[index], prevArgs ? prevArgs[index] : undefined);
      }
    }

    if (target.nodeType !== Node.TEXT_NODE) {
      shadyCSS(shady => {
        if (host.shadowRoot) {
          if (prevArgs) {
            shady.styleSubtree(host);
          } else {
            shady.styleElement(host);
          }
        }
      });
    }
  };
}

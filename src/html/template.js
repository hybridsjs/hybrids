import { createMap, shadyCSS, IS_IE } from '../utils';

import resolveStyleList from './style';
import resolveClassList from './classList';

const dataMap = createMap();

function getTemplateEnd(node) {
  let data;
  // eslint-disable-next-line no-cond-assign
  while (node && (data = dataMap.get(node)) && data.endNode) {
    node = data.endNode;
  }

  return node;
}

function removeTemplate(target) {
  if (target.nodeType !== Node.TEXT_NODE) {
    Array.from(target.childNodes).forEach(child =>
      child.parentNode.removeChild(child));
  } else {
    const data = dataMap.get(target);
    const startNode = data.startNode;

    if (startNode) {
      const endNode = getTemplateEnd(data.endNode);

      let node = startNode;
      const lastNextSibling = endNode.nextSibling;

      while (node) {
        const nextSibling = node.nextSibling;
        node.parentNode.removeChild(node);
        node = nextSibling !== lastNextSibling && nextSibling;
      }
    }
  }
}

function resolveValue(host, target, value) {
  const type = Array.isArray(value) ? 'array' : typeof value;
  let data = dataMap.get(target, {});

  if (data.type !== type) {
    removeTemplate(target);
    data = dataMap.set(target, { type });

    if (target.textContent !== '') {
      target.textContent = '';
    }
  }

  switch (type) {
    case 'function':
      value(host, target);
      break;
    case 'array':
      // eslint-disable-next-line no-use-before-define
      resolveArray(host, target, value);
      break;
    default:
      if (value !== data.value) {
        data.value = value;
        target.textContent = type === 'number' || value ? value : '';
      }
  }
}

function movePlaceholder(target, previousSibling) {
  const data = dataMap.get(target);
  const startNode = data.startNode;
  const endNode = getTemplateEnd(data.endNode);

  previousSibling.parentNode.insertBefore(target, previousSibling.nextSibling);

  let prevNode = target;
  let node = startNode;
  while (node) {
    const nextNode = node.nextSibling;
    prevNode.parentNode.insertBefore(node, prevNode.nextSibling);
    prevNode = node;
    node = nextNode !== endNode.nextSibling && nextNode;
  }
}

function resolveArray(host, target, value) {
  let previousSibling = target;
  const lastIndex = value.length - 1;
  const data = dataMap.get(target);
  const { arrayMap } = data;

  data.arrayMap = value.reduce((map, item, index) => {
    const id = typeof item === 'function' ? item.id : index;

    if (map.has(id)) {
      throw Error(`[html] '${id}' key already set. Use 'html\`...\`.key(id)' helper to set unique key.`);
    }

    let placeholder;
    if (arrayMap && arrayMap.has(id)) {
      placeholder = arrayMap.get(id);
      arrayMap.delete(id);

      if (placeholder.previousSibling !== previousSibling) {
        movePlaceholder(placeholder, previousSibling);
      }
    } else {
      placeholder = document.createTextNode('');
      previousSibling.parentNode.insertBefore(placeholder, previousSibling.nextSibling);
    }

    resolveValue(host, placeholder, item);

    previousSibling = getTemplateEnd(dataMap.get(placeholder).endNode || placeholder);

    if (index === 0) data.startNode = placeholder;
    if (index === lastIndex) data.endNode = previousSibling;

    map.set(id, placeholder);

    return map;
  }, new Map());

  if (arrayMap) {
    arrayMap.forEach((placeholder) => {
      removeTemplate(placeholder);
      placeholder.parentNode.removeChild(placeholder);
    });
  }
}

function resolveProperty(attrName, propertyName, isSVG) {
  if (propertyName.substr(0, 2) === 'on') {
    const fnMap = new WeakMap();
    const eventName = propertyName.substr(2);

    return (host, target, value) => {
      if (!fnMap.has(target)) {
        target.addEventListener(eventName, (...args) => {
          const fn = fnMap.get(target);
          if (fn) fn(host, ...args);
        });
      }

      fnMap.set(target, value);
    };
  }

  switch (attrName) {
    case 'style': return resolveStyleList;
    case 'class': return resolveClassList;
    default:
      return (host, target, value) => {
        if (!isSVG && propertyName in target) {
          if (target[propertyName] !== value) {
            target[propertyName] = value;
          }
        } else if (value === false || value === undefined || value === null) {
          target.removeAttribute(attrName);
        } else {
          const attrValue = value === true ? '' : String(value);
          if (target.getAttribute(attrName) !== attrValue) {
            target.setAttribute(attrName, attrValue);
          }
        }
      };
  }
}

function getPropertyName(string) {
  return string.replace(/\s*=\s*['"]*$/g, '').split(' ').pop();
}

function createWalker(node) {
  return document.createTreeWalker(
    node,
    // eslint-disable-next-line no-bitwise
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    null,
    false,
  );
}

const PLACEHOLDER = `{{h-${Date.now()}}}`;
const PLACEHOLDER_REGEXP = new RegExp(PLACEHOLDER, 'g');
const ATTR_PREFIX = `--${Date.now()}--`;
const ATTR_REGEXP = new RegExp(ATTR_PREFIX, 'g');

const preparedTemplates = new WeakMap();

function applyShadyCSS(template, tagName) {
  if (!tagName) return template;

  return shadyCSS((shady) => {
    let map = preparedTemplates.get(template);
    if (!map) {
      map = new Map();
      preparedTemplates.set(template, map);
    }

    let clone = map.get(tagName);

    if (!clone) {
      clone = document.createElement('template');
      clone.content.appendChild(document.importNode(template.content, true));

      map.set(tagName, clone);

      const styles = clone.content.querySelectorAll('style');

      Array.from(styles).forEach((style) => {
        const count = style.childNodes.length + 1;
        for (let i = 0; i < count; i += 1) {
          style.parentNode.insertBefore(document.createTextNode(PLACEHOLDER), style);
        }
      });

      shady.prepareTemplate(clone, tagName.toLowerCase());
    }
    return clone;
  }, template);
}

export function createSignature(parts) {
  const signature = parts.join(PLACEHOLDER);

  if (IS_IE) {
    return signature.replace(
      /style\s*=\s*(["][^"]+["]|['][^']+[']|[^\s"'<>/]+)/g,
      match => `${ATTR_PREFIX}${match}`,
    );
  }

  return signature;
}

export function compile(signature, rawParts, isSVG) {
  const template = document.createElement('template');
  const parts = [];

  template.innerHTML = signature;
  if (isSVG) {
    const svgRoot = template.content.firstChild;
    template.content.removeChild(svgRoot);
    Array.from(svgRoot.childNodes).forEach(node => template.content.appendChild(node));
  }

  const compileWalker = createWalker(template.content);
  let compileIndex = 0;

  while (compileWalker.nextNode()) {
    const node = compileWalker.currentNode;

    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent !== PLACEHOLDER) {
        node.textContent.replace(
          PLACEHOLDER,
          (text, offset) => {
            node.splitText(offset > 0 ? offset : text.length);
          },
        );
      }

      if (node.textContent === PLACEHOLDER) {
        if (!IS_IE) node.textContent = '';
        parts.push([compileIndex, resolveValue]);
      }
    } else {
      Array.from(node.attributes).forEach((attr) => {
        const value = attr.value.trim();
        const name = IS_IE ? attr.name.replace(ATTR_PREFIX, '') : attr.name;

        if (value === PLACEHOLDER) {
          const propertyName = getPropertyName(rawParts[parts.length]);
          parts.push([compileIndex, resolveProperty(name, propertyName, isSVG)]);
          node.removeAttribute(attr.name);
        } else {
          const results = value.match(PLACEHOLDER_REGEXP);
          if (results) {
            parts.push([compileIndex, (host, target, attrValue) => {
              target.setAttribute(name, value.replace(PLACEHOLDER, attrValue == null ? '' : attrValue));
            }]);

            for (let i = 1; i < results.length; i += 1) {
              parts.push([compileIndex, (host, target, attrValue) => {
                const previousValue = target.getAttribute(name);
                target.setAttribute(name, previousValue.replace(PLACEHOLDER, attrValue == null ? '' : attrValue));
              }]);
            }

            attr.value = value.replace(PLACEHOLDER_REGEXP, '');

            if (IS_IE && name !== attr.name) {
              node.setAttribute(name, attr.value);
              node.removeAttribute(attr.name);
            }
          }
        }
      });
    }

    compileIndex += 1;
  }

  return (host, target, args) => {
    const data = dataMap.get(target, { type: 'function' });

    if (template !== data.template) {
      if (data.template) removeTemplate(target);

      const fragment = document.importNode(applyShadyCSS(template, host.tagName).content, true);

      const renderWalker = createWalker(fragment);
      const clonedParts = parts.slice(0);

      let renderIndex = 0;
      let currentPart = clonedParts.shift();

      const markers = [];

      Object.assign(data, { template, markers });

      while (renderWalker.nextNode()) {
        const node = renderWalker.currentNode;

        if (IS_IE && node.nodeType === Node.TEXT_NODE) {
          if (node.textContent === PLACEHOLDER) {
            node.textContent = '';
          } else {
            node.textContent = node.textContent.replace(ATTR_REGEXP, '');
          }
        }

        while (currentPart && currentPart[0] === renderIndex) {
          markers.push([node, currentPart[1]]);
          currentPart = clonedParts.shift();
        }

        renderIndex += 1;
      }

      if (target.nodeType === Node.TEXT_NODE) {
        const childList = Array.from(fragment.childNodes);

        data.startNode = childList[0];
        data.endNode = childList[childList.length - 1];

        let previousChild = target;
        childList.forEach((child) => {
          target.parentNode.insertBefore(child, previousChild.nextSibling);
          previousChild = child;
        });
      } else {
        target.appendChild(fragment);
      }
    }

    let index = 0;

    data.markers.forEach(([node, fn]) => {
      fn(host, node, args[index], data);
      index += 1;
    });
  };
}

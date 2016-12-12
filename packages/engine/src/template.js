import { error } from '@hybrids/debug';

import Path from './path';
import Expression, { defineLocals, getOwnLocals, LOCALS_PREFIX } from './expression';
import { WATCHERS, PROPERTY_MARKER } from './symbols';

export const MARKER_PREFIX = '*';
export const PROPERTY_PREFIX = '@';
export const TEMPLATE_PREFIX = 'template:';

function walk(node, fn) {
  node = node.firstChild;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.COMMENT_NODE) {
      fn(node);
      walk(node, fn);
    }
    node = node.nextSibling;
  }
}

function createFragment(input) {
  const temp = document.createElement('template');
  temp.innerHTML = input;
  return temp.content;
}

function interpolate(node) {
  Array.from(node.childNodes).forEach((child) => {
    switch (child.nodeType) {
      case Node.TEXT_NODE: {
        if (node.nodeType === Node.ELEMENT_NODE &&
          node.childNodes.length === 1 &&
          child.textContent.trim().match(/^{{(([^}]|\n)+)}}$/g)) {
          let value = child.textContent.trim();
          value = value.substr(2, value.length - 4).trim();

          if (node.hasAttribute(`${PROPERTY_PREFIX}text-content`)) {
            error(
              SyntaxError,
              `interpolation conflict in {{ %s }} and ${PROPERTY_PREFIX}text-content attribute: %s`,
              value,
              node.outerHTML.replace(/[\n\t ]+/g, ' ')
            );
          } else {
            node.removeChild(child);
            node.setAttribute('____text-content', value);

            const temp = createFragment(
              node.outerHTML.replace('____text-content', `${PROPERTY_PREFIX}text-content`)
            ).childNodes[0];

            node.parentNode.insertBefore(temp, node);
            node.parentNode.removeChild(node);
          }
        } else {
          const result = child.textContent.replace(
            /{{(([^}]|\n)+)}}/g,
            (match, expr) => `<span ${PROPERTY_PREFIX}text-content="${expr.trim()}"></span>`
          );

          if (result !== child.textContent) {
            Array.from(createFragment(result).childNodes).forEach((newChild) => {
              node.insertBefore(newChild, child);
            });

            node.removeChild(child);
          }
        }

        break;
      }
      case Node.ELEMENT_NODE: {
        const wrappers = [];

        Array.from(child.attributes).forEach(({ name, value }) => {
          if (name.substr(0, 2) === `${MARKER_PREFIX}${MARKER_PREFIX}`) {
            child.removeAttribute(name);
            wrappers.push({ name: name.substr(2), value });
          }
        });

        wrappers.reduce((acc, { name, value }) => {
          const temp = createFragment(
            `<template ${MARKER_PREFIX}${name}="${value}"></template>`
          ).childNodes[0];

          node.insertBefore(temp, acc);
          temp.content.appendChild(acc);
          acc = temp;

          return acc;
        }, child);

        interpolate(child);
        break;
      }
      default: break;
    }
  });

  return node;
}

function parseEvaluate(input, container) {
  return input.split('|').map((i, index) => {
    const result = i.split(':').slice(0, 2).map(j => j.trim());

    if (index === 0) {
      const expr = result.pop();
      result.unshift(expr);
    }

    if (result[1]) result.splice(1, 1, ...result[1].split(',').map(j => j.trim()));

    if (!container[result[0]]) container[result[0]] = new Path(result[0]);
    return result;
  });
}

function parseNode(node, m, p) {
  let markers = 0;

  if (node.nodeType === Node.ELEMENT_NODE) {
    Array.from(node.attributes)
      .filter(({ name }) => name.length > 1)
      .forEach((attr) => {
        const prefix = attr.name.substr(0, 1);
        let id = attr.name.substr(1);

        markers = markers || [];

        switch (prefix) {
          case MARKER_PREFIX:
            attr.value.split(';').forEach((item) => {
              markers.push({ m: id, p: parseEvaluate(item, p) });
            });
            break;
          case PROPERTY_PREFIX:
            id = id.replace(/-([a-z])/g, g => g[1].toUpperCase());
            markers.push({ m: 0, p: parseEvaluate(`${id}:${attr.value || id}`, p) });
            break;
          default:
            break;
        }

        if (process.env.NODE_ENV === 'production') {
          node.removeAttribute(attr.name);
        }
      });
  }

  m.push(markers);
}

function parseTemplate(template, container) {
  const temp = document.createElement('template');
  const map = { c: temp.content, m: [] };
  const id = container.t.length;

  container.t.push(map);

  walk(interpolate(template.content), (node) => {
    parseNode(node, map.m, container.p);
    if (node instanceof HTMLTemplateElement) parseTemplate(node, container);
  });

  temp.content.appendChild(template.content);

  if (id) {
    template.parentNode.insertBefore(
      document.createComment(`${TEMPLATE_PREFIX}${id}`), template
    );
    template.parentNode.removeChild(template);
  }

  return container;
}

function getTemplateId(templateOrId) {
  switch (typeof templateOrId) {
    case 'object':
      return Number(templateOrId.textContent.replace(TEMPLATE_PREFIX, ''));
    default:
      return templateOrId;
  }
}

function getNodeOuterHTML(node, list) {
  if (node instanceof Comment) {
    node = list[getTemplateId(node)].c.children[0];
  }

  return `${node.outerHTML.match(/^<[^<]+>/i)}...`;
}

export default class Template {
  constructor(input, markers = {}, filters = {}) {
    switch (typeof input) {
      case 'object':
        this.container = {
          p: Object.keys(input.p).reduce((acc, key) => {
            acc[key] = new Path(input.p[key]);
            return acc;
          }, {}),
          t: input.t.map(({ c, m }) => ({ m, c: createFragment(c) })),
        };
        break;
      default: {
        const template = document.createElement('template');
        template.innerHTML = input;

        this.container = parseTemplate(template, { t: [], p: {} });
        break;
      }
    }

    this.markers = markers;
    this.filters = filters;
  }

  compile(controller, templateOrId = 0, locals = null) {
    const templateId = getTemplateId(templateOrId);
    const map = this.container.t[templateId];
    if (!map) error(ReferenceError, 'template not found: %s', templateId);

    const fragment = document.importNode(map.c, true);

    if (typeof templateOrId === 'object') {
      locals = Object.assign(getOwnLocals(templateOrId), locals);
    }

    if (locals) {
      Array.from(fragment.childNodes)
        .filter(n => n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.COMMENT_NODE)
        .forEach(n => defineLocals(n, locals));
    }

    let index = 0;

    walk(fragment, (node) => {
      const list = map.m[index];
      if (list) {
        list.forEach(({ m: markerId, p: paths }) => {
          try {
            markerId = markerId || PROPERTY_MARKER;
            const marker = this.markers[markerId];

            if (!marker) {
              error(ReferenceError, 'marker not found: %s', markerId);
            }

            const [exprKey, ...args] = paths[0];
            const filterList = paths.slice(1).map(([key, ...filterArgs]) =>
              value => this.container.p[key].call(this.filters, value, ...filterArgs)
            );

            const path = this.container.p[exprKey];
            const expr = new Expression(node, controller, path, filterList);
            const fn = marker(node, expr, ...args);

            if (fn) {
              if (!node[WATCHERS]) Object.defineProperty(node, WATCHERS, { value: new Set() });
              node[WATCHERS].add({
                fn,
                expr,
                rootProperty: path.rootProperty,
                locals: path.rootProperty[0] === LOCALS_PREFIX
              });
            }
          } catch (e) {
            error(e, 'compilation failed: %s', getNodeOuterHTML(node, this.container.t));
          }
        });
      }

      index += 1;
    });

    return fragment;
  }

  run(root, cb) {
    walk(root, (node) => {
      try {
        if ({}.hasOwnProperty.call(node, WATCHERS)) node[WATCHERS].forEach(w => cb(w));
      } catch (e) {
        error(e, 'execute: %s', getNodeOuterHTML(node, this.container.t));
      }
    });
  }

  export() {
    return JSON.parse(JSON.stringify(this.container, (key, value) => {
      if (Object(value) === value && value instanceof DocumentFragment) {
        return Array.from(value.childNodes).reduce((acc, c) =>
          (acc + c instanceof Comment ? `<!--${c.textContent}-->` : (c.outerHTML || ''))
        , '');
      }

      return value;
    }));
  }
}

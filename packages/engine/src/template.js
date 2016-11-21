import { error } from '@hybrids/debug';

import Path from './path';
import Expression, { defineLocals, getOwnLocals, LOCALS_PREFIX } from './expression';
import { WATCHERS, DEFAULT_MARKER } from './symbols';

const MARKER_PREFIX = '*';

function walk(node, fn) {
  node = node.firstElementChild || node.firstChild;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      fn(node);
      walk(node, fn);
    }
    node = node.nextElementSibling || node.nextSibling;
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
        const result = child.textContent.replace(
          /{{(([^}]|\n)+)}}/g,
          (match, expr) => `<span [text-content]="${expr.trim()}"></span>`
        );

        if (result !== child.textContent) {
          Array.from(createFragment(result).childNodes).forEach((newChild) => {
            node.insertBefore(newChild, child);
          });

          node.removeChild(child);
        }

        break;
      }
      default: {
        const wrappers = [];

        Array.from(child.attributes).forEach(({ name, value }) => {
          if (name.substr(0, 3) === `[${MARKER_PREFIX}${MARKER_PREFIX}`) {
            child.removeAttribute(name);
            wrappers.push({ name: name.substr(3, name.length - 4), value });
          }
        });

        wrappers.reduce((acc, { name, value }) => {
          const { children: [temp] } = createFragment(
            `<template [${MARKER_PREFIX}${name}]="${value}"></template>`
          );

          node.insertBefore(temp, acc);
          temp.content.appendChild(acc);
          acc = temp;

          return acc;
        }, child);

        interpolate(child);
      }
    }
  });
}

function parseEvaluate(input, container) {
  return input.split('|').map((i, index) => {
    const result = i.split(':').map(j => j.trim());
    if (index === 0) {
      const expr = result.pop();
      result.unshift(expr);
    }
    if (!container[result[0]]) container[result[0]] = new Path(result[0]);
    return result;
  });
}

function parseNode(node, m, p) {
  let markers = 0;

  try {
    Array.from(node.attributes || [])
      .filter(({ name }) => name.length > 1 && name.substr(0, 1) === '[')
      .forEach((attr) => {
        let id = attr.name.substr(1, attr.name.length - 2);

        if (!id) {
          error(SyntaxError, 'marker must not be empty');
        }

        markers = markers || [];

        if (id[0] === MARKER_PREFIX) {
          attr.value.split(';').forEach((item) => {
            markers.push({ m: id.substr(1), p: parseEvaluate(item, p) });
          });
        } else {
          id = id.replace(/-([a-z])/g, g => g[1].toUpperCase());
          markers.push({ m: 0, p: parseEvaluate(`${id}:${attr.value || id}`, p) });
        }

        if (process.env.NODE_ENV === 'production') {
          node.removeAttribute(attr.name);
        }
      });
  } catch (e) {
    error(e, 'parsing failed: %s...', node.outerHTML.match(/^<[^<]+>/i));
  }

  m.push(markers);
}

function parseTemplate(template, container) {
  const temp = document.createElement('template');
  const map = { c: temp.content, m: [] };
  const id = container.t.length;

  container.t.push(map);
  template.dataset.hid = id;

  interpolate(template.content);

  walk(template.content, (node) => {
    parseNode(node, map.m, container.p);
    if (node.content) parseTemplate(node, container);
  });

  Array.from(template.content.childNodes)
    .forEach(node => temp.content.appendChild(node));

  return container;
}

function getTemplateId(templateOrId) {
  switch (typeof templateOrId) {
    case 'object':
      return Number(templateOrId.dataset.hid);
    default:
      return templateOrId;
  }
}

export default class Template {
  constructor(input, markers, filters) {
    switch (typeof input) {
      case 'object':
        this.container = input;
        break;
      default: {
        const template = document.createElement('template');
        this.container = { t: [], p: {} };
        template.innerHTML = input.replace(/\n +/gi, '\n');
        parseTemplate(template, this.container);
        break;
      }
    }

    this.markers = markers;
    this.filters = filters;
  }

  compile(controller, templateOrId = 0, locals = null) {
    const map = this.container.t[getTemplateId(templateOrId)];
    const fragment = document.importNode(map.c, true);

    if (typeof templateOrId === 'object') {
      locals = Object.assign(getOwnLocals(templateOrId), locals);
    }

    if (locals) {
      Array.from(fragment.childNodes)
        .filter(n => n.nodeType === Node.ELEMENT_NODE)
        .forEach(n => defineLocals(n, locals));
    }

    let index = 0;

    walk(fragment, (node) => {
      const list = map.m[index];
      if (list) {
        list.forEach(({ m: markerId, p: paths }) => {
          try {
            markerId = markerId || DEFAULT_MARKER;
            const marker = this.markers[markerId];

            if (!marker) {
              error(ReferenceError, '[%s]: marker not found', markerId);
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
            error(e, 'compilation failed: %s', node.outerHTML.match(/^<[^<]+>/i));
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
        error(e, 'execute: %s', node.outerHTML.match(/^<[^<]+>/i));
      }
    });
  }

  serialize() {
    return JSON.parse(JSON.stringify(this.container, (key, value) => {
      if (Object(value) === value && value instanceof DocumentFragment) {
        return Array.from(value.childNodes).reduce((acc, c) => acc + (c.outerHTML || ''), '');
      }

      return value;
    }));
  }
}

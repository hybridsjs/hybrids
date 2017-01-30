import { error } from './debug';
import Path from './path';
import Expression, { defineLocals, getOwnLocals, LOCALS_PREFIX } from './expression';

export const MARKER_PREFIX = '--';
export const PROPERTY_PREFIX = ':';
export const EVENT_PREFIX = '@';
export const TEMPLATE_PREFIX = '*';

const watchersMap = new WeakMap();

function walk(node, fn) {
  node = node.firstChild;
  while (node) {
    if ((node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() !== 'style')
    || node.nodeType === Node.COMMENT_NODE) {
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

function getTemplateId(templateOrId) {
  switch (typeof templateOrId) {
    case 'object':
      return Number(templateOrId.textContent.split(':')[1]);
    default:
      return templateOrId;
  }
}

function normalizeWhitespace(input, startIndent = 0) {
  let i = input.indexOf('\n');
  if (i > -1) {
    let indent = 0 - startIndent - 2;
    for (i += 1; input[i] === ' ' && i < input.length; i += 1) { indent += 1; }
    return input.replace(/\n +/g, t => t.substr(0, Math.max(t.length - indent, 1)));
  }

  return input;
}

export function stringifyMarker(node, attr, templates) {
  if (process.env.NODE_ENV !== 'production') {
    let output;

    if (node.nodeType === Node.COMMENT_NODE) {
      node = templates[getTemplateId(node)].e;
    }

    if (node.nodeName !== 'TEMPLATE') {
      output = normalizeWhitespace((node).outerHTML);
    } else {
      output = `${node.outerHTML.match(/^<[^<]+>/i)}\n  ${normalizeWhitespace(node.innerHTML, 2)}\n</${node.nodeName.toLowerCase()}>`;
    }

    output = output.split('\n').map((line, index) => {
      if (!index) {
        const startIndex = line.indexOf(attr);
        return `| ${line}\n| ${' '.repeat(startIndex)}${'^'.repeat(attr.length)}`;
      }

      return `| ${line}`;
    }).join('\n');

    return `\n\n${output}\n`;
  }

  return '';
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

          node.removeChild(child);
          node.setAttribute(`${PROPERTY_PREFIX}text-content`, value);
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
          if (name.substr(0, 1) === TEMPLATE_PREFIX) {
            child.removeAttribute(name);
            wrappers.push({ name: name.substr(1), value });
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
        try {
          if (attr.name.substr(0, 2) === MARKER_PREFIX) {
            const id = attr.name.substr(2);
            markers = markers || [];
            attr.value.split(';').forEach((item) => {
              markers.push({ a: attr.name, m: id, p: parseEvaluate(item, p) });
            });
          } else {
            const prefix = attr.name.substr(0, 1);

            switch (prefix) {
              case PROPERTY_PREFIX: {
                const id = attr.name.substr(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
                markers = markers || [];
                markers.push({ a: attr.name, m: 'prop', p: parseEvaluate(`${id}:${attr.value || id}`, p) });
                break;
              }
              case EVENT_PREFIX: {
                const id = attr.name.substr(1);
                markers = markers || [];
                markers.push({ a: attr.name, m: 'on', p: parseEvaluate(`${id}:${attr.value || id}`, p) });
                break;
              }
              default: break;
            }
          }
        } catch (e) {
          error(e, 'template: Parsing failed %node', { node: stringifyMarker(node, attr.name) });
        }

        if (process.env.NODE_ENV === 'production') {
          node.removeAttribute(attr.name);
        }
      });
  }

  m.push(markers);
}

function parseTemplate(template, container) {
  const map = { e: template, m: [] };
  const id = container.t.length;
  const nestedTemplates = [];

  container.t.push(map);

  if (id) {
    template.parentNode.insertBefore(
      document.createComment(`template:${id}`), template
    );
    template.parentNode.removeChild(template);
  }

  walk(interpolate(template.content), (node) => {
    parseNode(node, map.m, container.p);
    if (node.nodeName === 'TEMPLATE') nestedTemplates.push(node);
  });

  nestedTemplates.forEach(node => parseTemplate(node, container));

  return container;
}

export default class Template {
  constructor(input, { markers = {}, filters = {}, name, styles } = {}) {
    this.markers = markers;
    this.filters = filters;

    if (typeof input === 'object') {
      if (input.nodeName === 'TEMPLATE') {
        input = input.innerHTML;
      } else {
        this.container = {
          p: Object.keys(input.p).reduce((acc, key) => {
            acc[key] = new Path(input.p[key]);
            return acc;
          }, {}),
          t: input.t.map((t, index) => {
            if (!index && styles) {
              [].concat(styles).forEach((style) => { t.e = `<style>${style}</style>${t.e}`; });
            }

            const template = document.createElement('template');
            template.innerHTML = t.e;
            t.e = template;

            return t;
          }).reduceRight((acc, t) => {
            if (global.ShadyCSS && name) global.ShadyCSS.prepareTemplate(t.e, name);
            acc.unshift(t);
            return acc;
          }, []),
        };

        return;
      }
    }

    if (styles) {
      [].concat(styles).forEach((style) => { input = `<style>${style}</style>${input}`; });
    }

    const template = document.createElement('template');
    template.innerHTML = input;

    if (global.ShadyCSS && name) global.ShadyCSS.prepareTemplate(template, name);

    this.container = parseTemplate(template, { t: [], p: {} });
  }

  compile(controller, templateOrId = 0, locals = null) {
    const templateId = getTemplateId(templateOrId);
    const map = this.container.t[templateId];
    if (!map) error(ReferenceError, 'template not found: %s', templateId);

    const fragment = document.importNode(map.e.content, true);

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
        list.forEach(({ a: attr, m: markerId, p: paths }) => {
          try {
            const marker = this.markers[markerId];

            if (process.env.NODE_ENV !== 'production' && !marker) {
              error(ReferenceError, "template: Marker '%markerId' not found", { markerId });
            }

            const [exprKey, ...args] = paths[0];
            const filterList = paths.slice(1).map(([key, ...filterArgs]) =>
              value => this.container.p[key].call(this.filters, value, ...filterArgs)
            );

            const path = this.container.p[exprKey];
            const expr = new Expression(node, controller, path, filterList);
            const fn = marker({ attr, node, expr }, ...args);

            if (fn) {
              let watchList = watchersMap.get(node);
              if (!watchList) {
                watchList = [];
                watchersMap.set(node, watchList);
              }
              watchList.push({ fn, expr, attr });
            }
          } catch (e) {
            error(e, 'template: Compilation failed %node', { node: stringifyMarker(node, attr, this.container.t) });
          }
        });
      }

      index += 1;
    });

    return fragment;
  }

  run(root, cb) {
    walk(root, (node) => {
      const list = watchersMap.get(node);
      if (list) {
        list.forEach((w) => {
          try {
            cb(w);
          } catch (e) {
            error(e, 'template: Execution failed %node', { node: stringifyMarker(node, w.attr, this.container.t) });
          }
        });
      }
    });
  }

  export() {
    return JSON.parse(JSON.stringify(this.container, (key, value) => {
      if (typeof value === 'object' && value.nodeName === 'TEMPLATE') {
        return value.innerHTML;
      }

      return value;
    }));
  }

  getRootPathProperties() {
    const paths = this.container.p;

    return new Set(Object.keys(paths)
      .filter(key => !(paths[key].isComputed && !paths[key].isNestedProperty))
      .map(key => paths[key].rootProperty)
      .filter(key => key[0] !== LOCALS_PREFIX)
    );
  }
}

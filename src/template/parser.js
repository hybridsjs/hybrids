import Path from './path';
import { dashToCamel } from '../utils';

export const TEMPLATE_PREFIX = '*';

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

          node.removeChild(child);
          node.setAttribute('prop:text-content', value);
        } else {
          const result = child.textContent.replace(
            /{{(([^}]|\n)+)}}/g,
            (match, expr) => `<span prop:text-content="${expr.trim()}"></span>`,
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
            `<template ${name}="${value}"></template>`,
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

function parseEvaluate(input, paths) {
  return input.split('|').map((i, index) => {
    const result = i.split(':').slice(0, 2).map(j => j.trim());

    if (index === 0) {
      const expr = result.pop();
      result.unshift(expr);
    }

    if (result[1]) result.splice(1, 1, ...result[1].split(',').map(j => j.trim()));

    if (!paths[result[0]]) paths[result[0]] = new Path(result[0]);
    return result;
  });
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

export function getTemplateId(templateOrId) {
  switch (typeof templateOrId) {
    case 'object':
      return Number(templateOrId.textContent.split(':')[1]);
    default:
      return templateOrId;
  }
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

function parseNode(node, m, p) {
  let markers = 0;

  if (node.nodeType === Node.ELEMENT_NODE) {
    Array.from(node.attributes)
      .filter(({ name }) => name.length > 1)
      .forEach((attr) => {
        const result = attr.name.match(/([^:]*):(.*)/);

        if (result) {
          const [, marker, id] = result;
          markers = markers || [];

          if (id) {
            markers.push({
              a: attr.name,
              m: marker,
              p: parseEvaluate(`${dashToCamel(id)}:${attr.value || id}`, p),
            });
          } else {
            attr.value.split(';').forEach((value) => {
              markers.push({
                a: attr.name,
                m: marker,
                p: parseEvaluate(value, p),
              });
            });
          }

          if (process.env.NODE_ENV === 'production') {
            node.removeAttribute(attr.name);
          }
        }
      });
  }

  m.push(markers);
}

export function walk(node, fn) {
  node = node.firstChild;
  while (node) {
    if (
      (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() !== 'style')
      || node.nodeType === Node.COMMENT_NODE
    ) {
      fn(node);
      walk(node, fn);
    }
    node = node.nextSibling;
  }
}

export function parseTemplate(template, container) {
  const map = { e: template, m: [] };
  const id = container.t.length;
  const nestedTemplates = [];

  container.t.push(map);

  if (id) {
    template.parentNode.insertBefore(
      document.createComment(`template:${id}`), template,
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

import {
  dataMap, removeTemplate, getTemplateEnd,
} from '../utils';

// eslint-disable-next-line import/no-cycle
import resolveValue from './value';

export const arrayMap = new WeakMap();

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

export default function resolveArray(host, target, value) {
  let lastEntries = arrayMap.get(target);
  const entries = value.map((item, index) => ({
    id: Object.prototype.hasOwnProperty.call(item, 'id') ? item.id : index,
    value: item,
    placeholder: null,
    available: true,
  }));

  arrayMap.set(target, entries);

  if (lastEntries) {
    const ids = new Set();
    entries.forEach(entry => ids.add(entry.id));

    lastEntries = lastEntries.filter((entry) => {
      if (!ids.has(entry.id)) {
        removeTemplate(entry.placeholder);
        entry.placeholder.parentNode.removeChild(entry.placeholder);
        return false;
      }

      return true;
    });
  }

  let previousSibling = target;
  const lastIndex = value.length - 1;
  const data = dataMap.get(target);

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    let matchedEntry;
    if (lastEntries) {
      for (let i = 0; i < lastEntries.length; i += 1) {
        if (lastEntries[i].available && lastEntries[i].id === entry.id) {
          matchedEntry = lastEntries[i];
          break;
        }
      }
    }

    let placeholder;
    if (matchedEntry) {
      matchedEntry.available = false;
      placeholder = matchedEntry.placeholder;

      if (placeholder.previousSibling !== previousSibling) {
        movePlaceholder(placeholder, previousSibling);
      }
      if (matchedEntry.value !== entry.value) {
        resolveValue(host, placeholder, entry.value);
      }
    } else {
      placeholder = document.createTextNode('');
      previousSibling.parentNode.insertBefore(placeholder, previousSibling.nextSibling);
      resolveValue(host, placeholder, entry.value);
    }

    previousSibling = getTemplateEnd(dataMap.get(placeholder).endNode || placeholder);

    if (index === 0) data.startNode = placeholder;
    if (index === lastIndex) data.endNode = previousSibling;

    entry.placeholder = placeholder;
  }

  if (lastEntries) {
    lastEntries.forEach((entry) => {
      if (entry.available) {
        removeTemplate(entry.placeholder);
        entry.placeholder.parentNode.removeChild(entry.placeholder);
      }
    });
  }
}

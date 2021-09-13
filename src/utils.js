const camelToDashMap = new Map();
export function camelToDash(str) {
  let result = camelToDashMap.get(str);
  if (result === undefined) {
    result = str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    camelToDashMap.set(str, result);
  }
  return result;
}

export function pascalToDash(str) {
  return camelToDash(str.replace(/((?!([A-Z]{2}|^))[A-Z])/g, "-$1"));
}

export function dispatch(host, eventType, options = {}) {
  return host.dispatchEvent(
    new CustomEvent(eventType, { bubbles: false, ...options }),
  );
}

export function shadyCSS(fn, fallback) {
  const shady = window.ShadyCSS;

  /* istanbul ignore next */
  if (shady && !shady.nativeShadow) {
    return fn(shady);
  }

  return fallback;
}

export function stringifyElement(target) {
  return `<${String(target.tagName).toLowerCase()}>`;
}

export function walkInShadow(target, cb) {
  if (target.nodeType === Node.ELEMENT_NODE) {
    cb(target);

    if (target.shadowRoot) {
      walkInShadow(target.shadowRoot, cb);
    }
  }

  const walker = document.createTreeWalker(
    target,
    NodeFilter.SHOW_ELEMENT,
    null,
    false,
  );

  while (walker.nextNode()) {
    const el = walker.currentNode;
    cb(el);
    if (el.shadowRoot) {
      walkInShadow(el.shadowRoot, cb);
    }
  }
}

export const deferred = Promise.resolve();
export const storePointer = new WeakMap();

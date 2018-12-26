// @flow

export function camelToDash(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function pascalToDash(str: string): string {
  str = str[0].toLowerCase() + str.slice(1);
  return camelToDash(str);
}

type EventInit = { bubbles?: boolean, cancelable?: boolean, composed?: boolean };
type CustomEventInit = EventInit & { detail: any };

export function dispatch(host: Element, eventType: string, options: CustomEventInit = {}) {
  return host.dispatchEvent(new CustomEvent(eventType, { bubbles: false, ...options }));
}

export function shadyCSS(fn: { prepareTemplate: (Element, string) => void } => any, fallback: any) {
  const shady = window.ShadyCSS;

  /* istanbul ignore next */
  if (shady && !shady.nativeShadow) {
    return fn(shady);
  }

  return fallback;
}

export function stringifyElement(element: Element): string {
  const tagName = String(element.tagName).toLowerCase();
  return `<${tagName}>`;
}

export const IS_IE = 'ActiveXObject' in window;

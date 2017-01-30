import { injectable } from './proxy';

export function dispatchEvent(host, name, options) {
  const config = Object.assign({ bubbles: true, cancelable: false }, options);
  let event;

  if (document.createEvent) {
    event = document.createEvent('CustomEvent');
    event.initCustomEvent(name, config.bubbles, config.cancelable, config.detail);
  } else {
    event = new CustomEvent(name, config);
  }

  host.dispatchEvent(event);
}

export default injectable(dispatchEvent);

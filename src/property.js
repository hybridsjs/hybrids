import { camelToDash } from './utils';

const defaultTransform = v => v;

const objectTransform = (value) => {
  if (typeof value !== 'object') {
    throw TypeError(`Assigned value must be an object: ${typeof value}`);
  }
  return value && Object.freeze(value);
};

export default function property(value, connect, observe) {
  const type = typeof value;
  let transform = defaultTransform;

  switch (type) {
    case 'string':
      transform = String;
      break;
    case 'number':
      transform = Number;
      break;
    case 'boolean':
      transform = Boolean;
      break;
    case 'function':
      transform = value;
      value = transform();
      break;
    case 'object':
      if (value) Object.freeze(value);
      transform = objectTransform;
      break;
    default: break;
  }

  let attrName;
  return {
    get: (host, val = value) => val,
    set: (host, val, oldValue) => transform(val, oldValue),
    // connect2: type !== 'object' && type !== 'undefined'
    //   ? (host, key, invalidate) => {
    //     if (host[key] === value) {
    //       const attrName = camelToDash(key);

    //       if (host.hasAttribute(attrName)) {
    //         const attrValue = host.getAttribute(attrName);
    //         host[key] = attrValue !== '' ? attrValue : true;
    //       }
    //     }

    //     return connect && connect(host, key, invalidate);
    //   }
    //   : connect,
    connect: (host, key, invalidate) => {
      attrName = camelToDash(key);
      if (host[key] === value) {
        if (host.hasAttribute(attrName)) {
          const attrValue = host.getAttribute(attrName);
          host[key] = attrValue !== '' ? attrValue : true;
        }
      }

      return connect && connect(host, key, invalidate);
    },
    observe: (host, val, oldValue) => {
      if (val === oldValue) return;
      
      switch (type) {
        case 'string':
        case 'number':
          host.setAttribute(attrName, val);
          break;
        case 'boolean':
          val ? host.setAttribute(attrName, '') : host.removeAttribute(attrName);
          break;
        case 'function':
          debugger;
          transform = value;
          value = transform();
          break;
        case 'object':
          debugger;
          if (value) Object.freeze(value);
          transform = objectTransform;
          break;
        default: break;
      }
    }
  };
}

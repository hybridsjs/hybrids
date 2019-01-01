import { camelToDash } from './utils';

const defaultTransform = v => v;

const objectTransform = (value) => {
  if (typeof value !== 'object') {
    throw TypeError(`Assigned value must be an object: ${typeof v}`);
  }
  return value && Object.freeze(value);
};

export default function property(value, connect) {
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

  return {
    get: (host, val = value) => val,
    set: (host, val, oldValue) => transform(val, oldValue),
    connect: type !== 'object' && type !== 'undefined'
      ? (host, key, invalidate) => {
        if (host[key] === value) {
          const attrName = camelToDash(key);

          if (host.hasAttribute(attrName)) {
            const attrValue = host.getAttribute(attrName);
            host[key] = attrValue !== '' ? attrValue : true;
          }
        }

        return connect && connect(host, key, invalidate);
      }
      : connect,
  };
}

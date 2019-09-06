import { camelToDash, coerceToType, getType } from './utils';

export default function reflect(value, properties = {}) {
  let attrName;
  const type = getType(value);
  const reflectedProperties = {
    connect: (host, key) => {
      attrName = camelToDash(key);
      const attrValue = host.getAttribute(attrName);
      if (attrValue !== null) {
        value = coerceToType(attrValue, type);
      }
      if (host[key] === undefined) {
        host[key] = value;
      }

      if (properties.connect) {
        properties.connect(host, key);
      }
    },
    observe: (host, val, oldValue) => {
      if (val !== oldValue) {
        switch (type) {
          case null:
          case undefined:
            break;
          case Boolean:
            if (val) {
              host.setAttribute(attrName, '');
            } else {
              host.removeAttribute(attrName);
            }
            break;
          case Array:
          case Object:
            host.setAttribute(attrName, JSON.stringify(val));
            break;
          case Function:
            break;
          case String:
          case Number:
          default:
            host.setAttribute(attrName, val);
            break;
        }
      }

      if (properties.observe) properties.observe(host, val, oldValue);
    },
    reflect: type,
  };

  if (properties) {
    return Object.assign({}, properties, reflectedProperties);
  }
  return reflectedProperties;
}

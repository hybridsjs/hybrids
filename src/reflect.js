import { camelToDash, coerceValue } from './utils';

function getType(value) {
  switch (typeof value) {
    case 'number': return Number;
    case 'boolean': return Boolean;
    case 'object':
      if (Array.isArray(value)) return Array;
      return Object;
    case 'function': return Function;
    case 'string':
    default: return String;
  }
}

export default function reflect(value, properties = {}) {
  let attrName;
  const type = getType(value);
  const reflectedProperties = {
    connect: (host, key) => {
      attrName = camelToDash(key);
      const attrValue = host.getAttribute(attrName);
      if (attrValue !== null) {
        value = coerceValue(attrValue, type);
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
          case Set:
          case Map:
            debugger;
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

import { camelToDash } from './utils';

export default function reflect(value) {
  let type = typeof value;
  const isObject = type === 'object';
  let attrName;
  const reflectedMethods = {
    connect: (host, key) => {
      attrName = camelToDash(key);
      if (!host.hasAttribute(attrName)) {
        host.setAttribute(attrName, value);
      }
      if (isObject && value.connect) {
        value.connect(host, key);
      }
    },
    observe: (host, val, oldValue) => {
      const oldType = typeof oldValue;
      const newType = typeof val;
      type = newType !== 'undefined' ? newType : oldType;

      switch (type) {
        case 'string':
        case 'number':
          host.setAttribute(attrName, val);
          break;
        case 'boolean':
          if (val) {
            host.setAttribute(attrName, '');
          } else {
            host.removeAttribute(attrName);
          }
          break;
        case 'function':
        case 'object':
          debugger;
          break;
        default: break;
      }

      if (isObject && value.observe) {
        value.observe(host, val, oldValue);
      }
    },
    reflect: type,
  };

  if (isObject) {
    return Object.assign({}, value, reflectedMethods);
  }
  return reflectedMethods;
}

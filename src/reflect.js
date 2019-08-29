import { camelToDash, coerceValue, setAttr } from './utils';

export default function reflect({ type, value, properties = {} }) {
  let attrName;
  const reflectedProperties = {
    connect: (host, key) => {
      attrName = camelToDash(key);
      const attrValue = host.getAttribute(attrName);
      const coercedAttrValue = coerceValue(attrValue, type);
      const currentValue = attrValue === null ? value : coercedAttrValue;
      host[key] = currentValue;

      if (coercedAttrValue !== currentValue) {
        setAttr(host, key, type, currentValue);
      }
      if (properties.connect) {
        properties.connect(host, key);
      }
    },
    observe: (host, val, oldValue) => {
      switch (type) {
        case String:
        case Number:
          host.setAttribute(attrName, val);
          break;
        case Boolean:
          if (val) {
            host.setAttribute(attrName, '');
          } else {
            host.removeAttribute(attrName);
          }
          break;
        case Function:
        case Object:
        case Array:
        case Set:
        case Map:
          debugger;
          break;
        default: break;
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

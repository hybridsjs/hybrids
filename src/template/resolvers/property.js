import resolveEventListener from './event';
import resolveClassList from './class';
import resolveStyleList from './style';

export default function resolveProperty(attrName, propertyName, isSVG) {
  if (propertyName.substr(0, 2) === 'on') {
    const eventType = propertyName.substr(2);
    return resolveEventListener(eventType);
  }

  switch (attrName) {
    case 'class': return resolveClassList;
    case 'style': return resolveStyleList;
    default:
      return (host, target, value) => {
        if (!isSVG && !(target instanceof SVGElement) && (propertyName in target)) {
          if (target[propertyName] !== value) {
            target[propertyName] = value;
          }
        } else if (value === false || value === undefined || value === null) {
          target.removeAttribute(attrName);
        } else {
          const attrValue = value === true ? '' : String(value);
          target.setAttribute(attrName, attrValue);
        }
      };
  }
}

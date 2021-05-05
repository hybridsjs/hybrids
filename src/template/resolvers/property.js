import resolveEventListener from "./event.js";
import resolveClassList from "./class.js";
import resolveStyleList from "./style.js";

export default function resolveProperty(attrName, propertyName, isSVG) {
  if (propertyName.substr(0, 2) === "on") {
    const eventType = propertyName.substr(2);
    return resolveEventListener(eventType);
  }

  switch (attrName) {
    case "class":
      return resolveClassList;
    case "style":
      return resolveStyleList;
    default: {
      let isProp = false;
      return (host, target, value) => {
        isProp =
          isProp ||
          (!isSVG && !(target instanceof SVGElement) && propertyName in target);
        if (isProp) {
          target[propertyName] = value;
        } else if (value === false || value === undefined || value === null) {
          target.removeAttribute(attrName);
        } else {
          const attrValue = value === true ? "" : String(value);
          target.setAttribute(attrName, attrValue);
        }
      };
    }
  }
}

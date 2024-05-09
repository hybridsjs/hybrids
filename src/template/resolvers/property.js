import resolveEventListener from "./event.js";
import resolveClassList from "./class.js";
import resolveStyleList from "./style.js";

function updateAttr(target, attrName, value) {
  if (value === false || value === undefined || value === null) {
    target.removeAttribute(attrName);
  } else {
    const attrValue = value === true ? "" : String(value);
    target.setAttribute(attrName, attrValue);
  }
}

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
      if (isSVG) {
        return (host, target, value) => {
          updateAttr(target, attrName, value);
        };
      }

      let isProp = undefined;
      return (host, target, value) => {
        if (isProp === undefined) {
          isProp = target.tagName !== "svg";
          if (isProp) {
            isProp = propertyName in target;
            if (!isProp) {
              propertyName = attrName.replace(/-./g, (match) =>
                match[1].toUpperCase(),
              );
              isProp = propertyName in target;
            }
          }
        }

        if (isProp) {
          target[propertyName] = value;
        } else {
          updateAttr(target, attrName, value);
        }
      };
    }
  }
}

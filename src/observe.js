function getPropertyDescriptor(target, key) {
  let desc = Object.getOwnPropertyDescriptor(target, key);

  if (!desc) {
    target = Object.getPrototypeOf(target);

    while (target) {
      desc = Object.getOwnPropertyDescriptor(target, key);
      if (desc) {
        break;
      } else {
        target = Object.getPrototypeOf(target);
      }
    }
  }

  if (desc) {
    if (!desc.configurable) {
      throw new TypeError(
        `Cannot create proxy for not configurable property '${key}'`);
    }
    if (!desc.get && !desc.set && !desc.writable) {
      throw new TypeError(
        `Cannot create proxy for readonly property '${key}'`);
    }
  }

  return desc;
}

function callIfChanged(oldValue, newValue, callback) {
  if ((oldValue !== newValue) || (typeof newValue === 'object' && newValue !== null)) {
    callback(oldValue, newValue);
  }
}

export default function observe(target, key, callback) {
  const desc = getPropertyDescriptor(target, key) || {
    enumerable: true,
    writable: true,
  };

  let value = target[key];

  Object.defineProperty(target, key, {
    configurable: false,
    enumerable: desc.enumerable,
    get: () => {
      if (desc.get) {
        value = desc.get.call(target);
      }

      callIfChanged(value, value, callback);

      return value;
    },
    set: (newValue) => {
      const oldValue = value;

      if (desc.set) {
        desc.set.call(target, newValue);
        value = desc.get.call(target);
      } else if (desc.writable) {
        value = newValue;
      }

      callIfChanged(oldValue, value, callback);
    },
  });
}

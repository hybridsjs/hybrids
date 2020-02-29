const targets = new WeakMap();

export default function resolveEventListener(eventType) {
  return (host, target, value, lastValue) => {
    if (lastValue) {
      const eventMap = targets.get(target);
      if (eventMap) {
        target.removeEventListener(
          eventType,
          eventMap.get(lastValue),
          lastValue.options !== undefined ? lastValue.options : false,
        );
      }
    }

    if (value) {
      if (typeof value !== "function") {
        throw Error(`Event listener must be a function: ${typeof value}`);
      }

      let eventMap = targets.get(target);
      if (!eventMap) {
        eventMap = new WeakMap();
        targets.set(target, eventMap);
      }

      const callback = value.bind(null, host);
      eventMap.set(value, callback);

      target.addEventListener(
        eventType,
        callback,
        value.options !== undefined ? value.options : false,
      );
    }
  };
}

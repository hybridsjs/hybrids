const eventMap = new WeakMap();

export default function resolveEventListener(eventType) {
  return (host, target, value, lastValue) => {
    if (lastValue) {
      target.removeEventListener(
        eventType,
        eventMap.get(lastValue),
        lastValue.options !== undefined ? lastValue.options : false,
      );
    }

    if (value) {
      if (typeof value !== 'function') {
        throw Error(`Event listener must be a function: ${typeof value}`);
      }

      eventMap.set(value, value.bind(null, host));

      target.addEventListener(
        eventType,
        eventMap.get(value),
        value.options !== undefined ? value.options : false,
      );
    }
  };
}

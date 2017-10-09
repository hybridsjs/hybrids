export function camelToDash(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function pascalToDash(str) {
  str = str[0].toLowerCase() + str.slice(1);
  return camelToDash(str);
}

export function dashToCamel(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

export function defer(fn) {
  let request;
  return function wrapper() {
    if (!request) {
      request = Promise.resolve().then(() => {
        fn();
        request = undefined;
      });
    }
  };
}

import { COMPONENT } from '../symbols';

export default () => (key, Wrapper, Component) => {
  if (!Reflect.has(Component.prototype, key)) {
    throw Error(`'${key}' not found in ${Component.name} prototype`);
  }

  const temp = {
    [key](...args) {
      return this[COMPONENT][key](...args);
    },
  };

  Wrapper.prototype[key] = temp[key];
};

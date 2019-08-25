export default function reflect(value) {
  const type = typeof value;
  const isObject = type === 'object';
  let attrName;
  const reflectedMethods = {
    connect: (host, key) => {
      attrName = key;
      if (isObject && value.connect) {
        value.connect(host, key);
      }
    },
    observe: (host, val, oldValue) => {
      const oldType = typeof oldValue;
      const newType = typeof val;
      const type = newType !== 'undefined' ? newType : oldType;

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

      // console.log('aoeu')
      // debugger

      // if (val !== oldValue) {
      //   // const type = typeof val;
      //   switch (type) {
      //     case 'string':
      //     case 'number':
      //       host.setAttribute(attrName, val);
      //       break;
      //     case 'boolean':
      //       val ? host.setAttribute(attrName, '') : host.removeAttribute(attrName);
      //       break;
      //     case 'function':
      //       debugger;
      //       // transform = value;
      //       // value = transform();
      //       break;
      //     case 'object':
      //       debugger;
      //     //   if (value) Object.freeze(value);
      //     //   transform = objectTransform;
      //       break;
      //     default: break;
      //   }        
      // }
  
      if (isObject && value.observe) {
        value.observe(host, val, oldValue);
      }
    },
    reflect: type,
  }
 
  if (isObject) {
    return Object.assign({}, value, reflectedMethods);
  } else {
    return reflectedMethods;
  }
}
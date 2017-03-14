# Plugins

Plugins extend core functionality. You can use one of the provided by the library, or use a custom one. To add a plugin to hybrid component, use **plugins** option:

```javascript
import { engine } from '@hybrids/engine';
import superPlugin from 'hybrids-super-plugin';

class MyElement {
  static get options() {
    return {
      plugins: [engine, superPlugin],
      // plugins options
      template: `...`,
      superOption: 'value',
    };
  }
  
  ...
}
```

> Plugins provided by the library are listed in [Installation](./installation.md) section

Plugins may add custom options to configuration object (e.g. `template` or `superOption`). All options are passed to plugin, when it is initialized.

## Plugin API

Plugin is a function, that is invoked when hybrid component is defined. It can also return a function, which is called when custom element is created. The structure can be defined like this:

```javascript
export function plugin(options, Component) {
  // Called once for component definition
  // You can use global options and transform or compile them
  
  // For example, do something if component has `method` in prototype
  if (Component.prototype.method) {...}

  return (host, controller) => {
    // Called for every custom element instance
    // when element is created
  };
}
```

* `options` is a configuration object. Beside defined options, it has additional `name` key with custom element name passed to `define()` method. You can access `options` through `Component.options`, but better way is to use first argument (especially for destructuring). Usually plugins need only static configuration, so second argument can be omitted.
* `Component` is a hybrid component class definition
* When plugin returns a function, it is called when custom element is created. That function takes following arguments:
  * `host` is a custom element instance
  * `controller` is a hybrid component instance
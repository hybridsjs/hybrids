# Component Structure

A complete hybrid component structure looks like this:

```javascript
class MyElement {
  static get options() {
    return {
      plugins: [...],
      properties: ['one', { property: 'two', ... }],
      define: { OtherElement },
    };
  }

  constructor() {
    this.one = 'default value';
    this.two = true;
  }

  connect() {
    // Called when element is connected to DOM
  }

  disconnect() {
    // Called when element is disconnected from DOM
  }
}
```

### Configuration

Custom element configuration is stored in static `options` property. It can be defined as a static property getter or a [class public field](https://github.com/tc39/proposal-class-public-fields):

```javascript
class MyElement {
  static options = {
    plugins: [...],
    properties: ['one', { property: 'two', ... }],
    define: { OtherElement },
  }
  ...
}
```

> Class public field is an active proposal to EcmaScript

### Available Options

* **plugins**: `[...]` - list of plugins, that extend basic functionality of the core \(e.g. view layer engine or data state management\). Read more in [Plugins](./plugins.md) section.
* **properties:** `[...]` - list of properties and methods, that should be a part of custom element API. Read more in [Attribute & Property Mapping](./attribute-and-property-mapping.md) section.
* **define:** `{ ... }` - map of hybrid components, that will be passed to `define()` method. This feature allows to structure component dependencies. Read more in [Element Definition](./element-definition.md) section.

Other options can be used by plugins to set their configuration.

## Lifecycle callbacks

Custom Elements API provides lifecycle callbacks. Library connects `connectedCallback()` as `connect()` and `disconnectedCallback()` as `disconnect()`. These methods are invoked synchronously with corresponding custom element callbacks.

### Public Properties

`attributeChangeCallback` is used internally for attribute and property mapping. It has no corresponding method in component definition. Component properties will be set automatically according to your `properties` configuration.

If you want to observe when property is changed, you can use pattern recommended by the specification or use external library.

#### Getter / Setter Property

```javascript
class MyElement {
  static get options() {
    return {
      properties: ['one'],
    }
  }

  constructor() {
    this.$one = 'default value';
  }

  get one() {
    console.log('one is get');
    return this.$one;
  }

  set one(val) {
    console.log('one is set');
    this.$one = val;
  }
}
```

#### External Library

For example, you can use [`papillon`](https://github.com/smalluban/papillon) library \(it is used by some hybrids plugins\):

```javascript
import { Observer } from 'papillon';

class MyElement {
  static get options() {
    return {
      properties: ['one'],
    }
  }

  constructor() {
    this.one = 'default value';

    this.observer = new Observer(this, 'one', (changelog) => {
      console.log('Property "one" has changed', changelog.one);
    });
  }
}
```




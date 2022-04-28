# Migration Guide

## v8.0.0

### Browser Support

The `v8` release drops support for the webcomponents polyfill. Currently, all of the modern browsers support Shadow DOM, so we can safely remove the support for the polyfill. Legacy Edge is no longer supported by the Microsoft, and support for the IE was already dropped in `v5.0.0`.

## v7.0.0

The `v7` major release focuses on cleaning up and removing rarely used features. There are several breaking changes, but usually updating from earlier versions should not require code changes if you followed the translation rules in the component definition. Otherwise, use the instructions to update your code.

### Component Model

#### Property Factory

The `property` factory is replaced by the `value` option in the object descriptor. If you use property factory explicitly, you must update your code.

* Instead of using function arguments for `connect` and `observe` methods, use corresponding options in the object descriptor:

  ```javascript
  // before
  customName: property("someValue", (host, key) => ..., ...)
  ```

  ```javascript
  // after
  customName: {
    value: "someValue",
    connect(host, key) {...},
    observe(host, value, lastValue) {...},
  }
  ```

* The custom transform function is no longer supported. Use the `set` method of the object descriptor:

  ```javascript
  function getDate(date) {
    return new Date(date);
  }
  ```

  ```javascript
  // before
  myDate: property(getDate)
  ```

  ```javascript
  // after
  myDate: {
    set: (host, value) => getDate(value),
  }
  ```

* The `null` value with freezing protection is no longer supported. Use `undefined` value to avoid value transformation:

  ```javascript
  // before
  customProperty: null
  ```

  ```javascript
  // after
  customProperty: undefined
  ```

  If you need protection over the passed data, it is recommended to use the store, and define your property by the store factory.

* An array instance as a value is no longer supported. Use the `set` method of the object descriptor:

  ```javascript
  // before
  myArray: [1, 2, 3]
  ```

  ```javascript
  // after
  myArray: {
    get: (host, value = [1, 2, 3]) => value,
    set: (host, value) => {
      // Optional deserialization from attribute with: "1 2 3"
      if (typeof value === "string") {
        value = value.split(" ");
      }

      return [...value],
  }
  ```

#### Render Factory

The `render` factory is no longer supported - you must set `render` or `content` property to a function to get the rendering feature from the library.

If you update the DOM using another property name, you must create a custom factory for the property. You can follow the old implementation of the `render` factory available here:

https://github.com/hybridsjs/hybrids/blob/v6.1.0/src/render.js

#### Templates

The `define` helper method in the result of the `html` and `svg` function is no longer supported - define each element explicitly:

```javascript
// before
import OtherElement from "./other-element.js";

define({
  tag: "my-element",
  render: () => html`
    <other-element>...</other-element>
  `.define({ OtherElement }),
});
```

```javascript
// after
define(OtherElement);

define({
  tag: "my-element",
  render: () => html`
    <other-element>...</other-element>
  `,
});
```

#### Definition

The definition without explicit tag name by the `define` function is replaced with the `define.compile()` method:

```javascript
// before
const MyElementConstructor = define(null, { ... });
```

```javascript
// after
const MyElementConstructor = define.compile({ ... });
```

#### TypeScript

The `Hybrids<E>` type is replaced with the `Component<E>` type:

```javascript
// before
import { Hybrids } from "hybrids";

const MyElement: Hybrids<MyElement> = { ... };
```

```javascript
// after
import { Component } from "hybrids";

const MyElement: Component<MyElement> = { ... };
```

### Store

#### Identifier

The shorter syntax of the store factory options argument is no longer supported - the `id` must be set explicitly in the options object:

```javascript
// before
data: store(Data, "dataId")
```

```javascript
// after
data: store(Data, { id: "dataId" })
```

# Structure

The component structure is based on a plain object with a number of properties defined by the descriptors. Generally, you don't have to use descriptor objects explicitly, because the library uses other types of values to generate them for you. As the result, the values of the properties can be also the primitives or functions that return values.

If some additional conditions are met, the library applies unique behavior to the property. However, the only reserved property name in the definition is the `tag`, which sets the custom element tag name.

## Cache

The library uses unique cache and change detection mechanisms, which allow detecting dependencies between the properties. The value of the property is only recalculated when it is accessed and the value of its dependencies has changed. If the property does not use other properties, it won’t be called again, and the first cached value is always returned.

The property is accessed automatically only if it is explicitly observed by the `observe` option in the descriptor or if it is a dependency of another observed property. The cache mechanism uses equality check to compare values (`nextValue` !== `lastValue`), so it enforces using immutable data. If the next and previous values are equal, the observe method is not called.

## Values

### Primitives

If the property value is a `string`, `boolean`, `number` or `undefined`, the library creates a writable property with a default value (using [property descriptor](#descriptor) implicitly with the `value` option).

Except for the `undefined`, the value type is protected and proper conversion is performed when a new value is set.

```javascript
import { define } from "hybrids";

define({
  tag: "my-element",
  firstName: "John",
  lastName: "Doe",
  isAdmin: false,
});
```

#### Attributes

All writable properties (not only primitives) use a corresponding dashed-cased attribute from the element for setting the initial value. Use the attribute only to define static values in the templates or the document, as the attribute changes are not being watched, and updating the attribute does not set the property.

Set static values in templates:

```html
<my-element first-name="Mark" last-name="Twain"></my-element>
```

Update the value by setting the property:

```javascript
const el = document.getElementsByTagName("my-element")[0];
el.firstName = "George";

// returns "George"
el.getAttribute("first-name"); 
```

However, only properties set by the primitive or the `value` descriptor with  `string`, `boolean` or `number` reflects back the current value of the property to the corresponding attribute. You can use this feature to create CSS selectors in Shadow DOM, like `:host([is-admin])`.

#### Booleans

The library follows the HTML standard when transforming attributes to the boolean type. An empty value of an existing attribute is interpreted as `true`. For setting `false` by the attribute, you must not set the attribute at all. It means, that if you want to support the boolean attribute, it is best to set the default value of the property to `false`.

For example, if you want to create an on/off switch, depending on the default value, create `on` or `off` property with `false` default value:

```html
<!-- off by default (on: false), set attribute to turn on -->
<my-element on></my-element>

 <!-- on by default (off: false), set attribute to turn off -->
<my-element off><my-element>
```

In the templates you can set a `false` value regardless of the default value:

```javascript
html`
  <my-element mySwitch="${false}"></my-element>
`
```

### Computed Values

If the property value is a function, the library creates a read-only property with the function as a getter (using [property descriptor](#descriptor) implicitly with `get` option), except a special behavior of the `render` and `content` properties described below.

The function is called with the custom element instance and last cached value of the property (read more in [`get and set`](#get-amp-set) section). Usually, the first argument is sufficient, which also can be destructured:

```javascript
import { define } from "hybrids";

define({
  tag: "my-element",
  firstName: "John",
  lastName: "Doe",
  fullName: ({ firstName, lastName }) => `${firstName} ${lastName}`,
});
```

### `render` & `content`

If the value of the `render` or `content` property is a function, the library creates a read-only property (using [property descriptor](#descriptor) implicitly with `get` and `observe` options), which returns a function for updating the Shadow DOM or content of the custom element.

The function is called automatically when dependencies change, but it can also be called manually, by `el.render()` or `el.content()`.

> You can use built-in [template engine](/component/templates.md) with those properties without additional code

#### Shadow DOM

Use the `render` key for the internal structure of the custom element, where you can add isolated styles, slot elements, etc.

```javascript
import { define, html } from "hybrids";

define({
  tag: "my-element",
  name: "",
  render: ({ name }) => html`
    <h1>Hello ${name}!</h1>
  `.css`
    :host { display: block; }
    h1 { color: red }
  `,
});
```

The Shadow DOM supports setting the `delegatesFocus` option. You can use it by assigning a boolean value to the `delegatesFocus` property of the function:

```javascript
import { define, html } from "hybrids";

define({
  tag: "my-element",
  render: Object.assign(() => html`<div>...</div>`, { delegatesFocus: true }),
});
```

#### Element's Content

Use the `content` property for rendering templates in the content of the custom element. By the design, it does not support isolated styles, slot elements, etc.

However, it might be the way to build an app-like views structure, which can be rendered as a document content in light DOM, so it is easily accessible in developer tools and search engines. For example, form elements (like `<input>`) have to be in the same subtree with the `<form>` element.

```javascript
import { define, html } from "hybrids";

define({
  tag: "my-element",
  name: "",
  content: ({ name }) => html`<h1>Hello ${name}!</h1>`
});
```

#### Mixed Content

You can use `render` and `content` properties together if you have a complex layout structure of the view, which can be hidden, but still, you want to push some content into the accessible DOM.

```javascript
import { define, store, html } from "hybrids";

define({
  tag: "my-element",
  data: store(SomeComplexData),
  render: () => html`
    <div>
      <slot name="some"></slot>
    </div>
    ...
  `.css`
    :host { display: block; }
    ...
  `,
  content: ({ data }) => html`
    ${store.ready(data) && html`
      <my-title>${data.title}</my-title>
      <other-element slot="some">${data.value}</other-element>
    `}
  `
});
```

#### Custom Function

The preferred way is to use a built-in [template engine](/component/templates.md), but you can use any function to update the DOM of the custom element, which accepts the following structure:

```javascript
import React from "react";
import ReactDOM from "react-dom";

export default function reactify(fn) {
  return (host) => {
    // get the component using the fn and host element
    const Component = fn(host); 

    // return the update function
    return (host, target) => {
      ReactDOM.render(Component, target);
    }
  }
}
```

```javascript
import reactify from "./reactify.js";

function MyComponent({ name }) {
  return <div>{name}</div>;
}

define({
  tag: "my-element",
  render: reactify(({ name }) => <MyComponent name={name} />),
})
```

The above example uses the [`factory` pattern](#factories), to produce a function, which accepts the host element and returns the update function, which has `host` and `target` arguments. The `target` argument in the update function can be a `host` or `host.shadowRoot` depending on the property name.

!> The other properties from the `host` must be called in the main function body (not in the update function), as only then they will be correctly observed

#### Reference Internals

Both `render` and `content` properties can be used to reference internals of the custom element. The DOM update process is asynchronous, so to avoid rendering timing issues, always use a property as a reference to the target element. If the property depending on `render` or `content` is called before the first update, the update will be triggered manually by calling the function.

```javascript
import { define, html } from "hybrids";

define({
  tag: "my-element",
  input: ({ render }) => render().querySelector("#input"),
  render: () => html`
    <input id="input" />
  `,
});
```

## Descriptor

Regardless of the property name, for full custom control over the property behavior, use the object descriptor. Its structure is similar to the property descriptor passed to `Object.defineProperty()`:

```typescript
{
  value?: string | boolean | number | undefined;
  get?: (host, lastValue) => { ... };
  set?: (host, value, lastValue) => { ... };
  connect?: (host, key, invalidate) => { ... };
  observe?: (host, value, lastValue) => { ... };
}
```

The descriptor can be defined with the `value` option, or with `get` and `set` methods. Additionally, it supports the `connect` method for the initial setup and the `observe` method for observing changes in the property value.

All writable properties (defined with `value` option, or with `set` method) support initial value from corresponding dashed-cased attribute described in [Attributes](#attributes) section of the primitive values.

### `value`

The `value` defines a writable property, which value type must be a `string`, `boolean`, `number` or `undefined`. The property uses the dashed-cased attribute for the initial value, and reflects back the value to attribute if the value is not a `undefined`.

```javascript
import { define } from "hybrids";

define({
  tag: "my-element",
  name: {
    value: "John",
    observe(host, value, lastValue) {
      console.log(`${value} -> ${lastValue}`);
    },
  },
});
```

The `name` property object descriptor in the above definition is almost identical to setting the property as a string primitive. However, using the descriptor over the string allows adding `observe` or `connect` methods to the definition.

### `get` & `set`

Use the `get` or `set` method if you need to perform some additional actions to calculate the property value.

```javascript
import { define } from "hybrids";

define({
  tag: "my-element",
  name: {
    get(host, lastValue) {
      // calculate the current value
      const value = ...;

      return value;
    },
    set(host, value, lastValue) {
      // use a value from the assertion
      const nextValue = doSomething(value);

      return nextValue;
    },
  },
});
```

* **arguments**:
  * `host` - an element instance
  * `value` - a value passed to assertion (ex., el.myProperty = 'new value')
  * `lastValue` - last cached value of the property

Without the `set` method the property will be read-only. If the `get` method is omitted, getting the property resolves to the last set value.

### `connect`

Use the `connect` method to attach event listeners, initialize property value (using key argument), and more. To clean up subscriptions, return a `disconnect` function, where you can remove attached listeners and other things.

When you insert, remove, or relocate an element in the DOM tree, `connect` and `disconnect` is called synchronously (in the `connectedCallback` and `disconnectedCallback` callbacks of the Custom Elements API).

```javascript
import { define } from "hybrids";

define({
  tag: "my-element",
  name: {
    get: () => api.get("value"),
    connect(host, key, invalidate) {
      // get the current value
      const value = host[key];
      ...

      // connect to external library and invalidate on change
      const subscription = api.subscribe(() => invalidate());


      // return `disconnect` function
      return () => {
        // clean up
        subscription.unsubscribe();
      };
    },
  },
});
```

If the third-party code is responsible for the property value, you can use the `invalidate` callback to notify that value should be recalculated. For example, it can be used to connect to async web APIs or external libraries.

The `invalidate` callback can take options object argument with the following properties:

| Option | Type      | Default | Description                                                                                                     |
| ------ | --------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| force  | `boolean` | false   | When true, the invalidate call will always trigger an update, even if the property's identity has not changed   |

### `observe`

Use the `observe` method for calling side effects, when the property value changes. The method is called asynchronously and execution batches synchronous changes. If the updates compensate, and the result value is the same as before, the function is not called.

```javascript
import { define } from "hybrids";

define({
  tag: "my-element",
  name: {
    ...,
    observe(host, value, lastValue) {
      console.log(`${value} -> ${lastValue}`);
    },
  },
});
```

* **arguments**:
  * `host` - an element instance
  * `value` - current value of the property
  * `lastValue` - last cached value of the property

## Factories

The factory is a simple concept based on a function, which produces the property descriptor. The main goal of the factory is to hide implementation details and minimize redundant code. It allows reusing property behavior while giving the ability to pass additional parameters.

In most cases, descriptors are similar and have limited differences, so they can be parameterized by the function arguments. Also, the factory function can use the local scope for setting variables required for the feature.

```javascript
import { define } from "hybrids";

function myCustomProperty(multiplier) {
  return {
    get: (host, value) => value | 0,
    set: (host, value) => value * multiplier,
  };
}

define({
  tag: "my-element",
  value: myCustomProperty(2),
});
```

The above `value` property is defined by the factory, which returns a property descriptor. In this case, its value is equal to the result of multiplying it by the `multiplier` argument.

More complex structures provided by the library are defined as factories: [parent & children](./parent-children.md), [store](/store/overview.md) and [router](/router/overview.md). For example, the store allows to connect global data models with the component definition just by adding a single line of code:

```javascript
import { define, store } from "hybrids";
import DataSource from "./models/DataSource.js";

define({
  tag: "my-element",
  data: store(DataSource),
  render: ({ data }) => html`
    ${store.ready(data) && html`<div>${data.value}</div>`}
  `,
});
```

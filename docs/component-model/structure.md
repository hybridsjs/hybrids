# Component Structure

The component definition is based on a plain object with a number of properties. The library checks the type of the property value to generate descriptors, which then are used in the custom element class definition. The values can be primitives, functions, or if you need a full control - object descriptors.

## Cache & Change Detection

The core idea of the hybrid properties is its unique cache and change detection mechanism. It tracks dependencies between the properties (even between different custom elements) and notify about changes. Still, the value of the property is only recalculated when it is accessed and the value of its dependencies has changed. If the property does not use other properties, it won’t be recalculated, and the first cached value is always returned.

> The property is accessed automatically only if it is explicitly observed by the `observe` method in the object descriptor or if it is a dependency of another observed property

The cache mechanism uses equality check to compare values (`nextValue` !== `lastValue`), so it enforces using **immutable data**. If the next and previous values are equal, the `observe` method won't be called.

## Reserved Keys

There are two reserved property names in the definition:

* `tag` - a string which sets the custom element tag name
* `render` - expects its value as a function for rendering the internal structure of the custom element

## Translation

If the property value is not an object instance, the library translates it to the object descriptor with the `value` option:

```javascript
property: "something" -> property: { value: "something" }
```

### Shorthand Syntax

Use primitive or `function` as a property value:

```javascript
define({
  tag: "my-element",
  firstName: "John",
  lastName: "Doe",
  name: ({ firstName, lastName }) => `${firstName} ${lastName}`,
});
```

### Full Descriptor Syntax

Use the full object descriptor with the `value` option:

```javascript
define({
  tag: "my-element",
  name: {  value: "John" },
  lastName: { value: "Doe" },
  name: { 
    value: ({ firstName, lastName }) => `${firstName} ${lastName}`
  },
});
```

Usually, the shorthand syntax is more readable and less verbose, but the second one gives more control over the property behavior, as it provides additional options.

## Attributes

Writable properties use the corresponding dashed-cased attribute for the initial value when the custom element is being created. Use the attributes only to define static values in the templates or the document, as the attribute changes are not being watched, and setting the attribute does not update the property.

Use static values in the templates:

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

### Booleans

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

## Property Descriptor

The property descriptor structure is a plain object with the `value` and number of options:

```typescript
{
  property: {
    value:
      | string | boolean | number 
      | object | undefined | null
      | (host) => { ...}
      | (host, value) => { ... };
    connect?: (host, key, invalidate) => { ... };
    observe?: (host, value, lastValue) => { ... };
    reflect?: boolean | (value) => string;
  }
  ...,
}
```

### value

#### Primitives & Objects

```ts
value: string | boolean | number | object | undefined | null
```

If the descriptor `value` option is a primitive, undefined, null or an object instance, the library creates a writable property with defined default value. For the primitives, the value type is protected and proper conversion is performed when a new value is set.

```javascript
define({
  tag: "my-element",
  firstName: "John",
  lastName: "Doe",
  isAdmin: false,
});
```

A default value as an object instance can only be set using full object descriptor with `value` option:

```javascript
define({
  tag: "my-element",
  data: { value: ['a', 'b', 'c'] },
});
```

The cache mechanism utilizes strong equality check, so the object instances for default values must be frozen during the compilation step of the component definition. Keep in mind, that it might be not compatible with some external libraries, which require mutable objects (You can use computed property with a function, which returns a new object instance).

#### Function

```ts
value: (host) => { ... } | (host, value) => { ... }
```

* **arguments**:
  * `host` - an element instance
  * `value` - a value passed to assertion (ex., el.myProperty = 'new value')
* **returns**:
  * a value of the property

If the descriptor `value` option is a function, the library creates a property with a getter, and optionally with a setter (if the function has more than one argument).

#### Readonly

If the function has only one argument, the property will be read-only, and the function is called with the element instance:

```javascript
define({
  tag: "my-element",
  firstName: "John",
  lastName: "Doe",
  fullName: ({ firstName, lastName }) => `${firstName} ${lastName}`,
});
```

#### Writable

If the function has two arguments, the property will be writable. However, the function is called only if the value of the property is accessed (getter) - the asserted value is kept in the cache until the next access.

```javascript
define({
  tag: "my-element",
  data: (host, value) => value ? JSON.parse(value) : null,
});
```

The library uses `fn.length` to detect number of arguments, so the [default parameters](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/Default_parameters) and the [rest parameters](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/rest_parameters) syntax cannot be used for the function arguments:

```javascript
// won't work (fn.length === 1)
data: (host, value = '[]') => JSON.parse(value),

// won't work (fn.length === 1)
data: (host, ...rest) => JSON.parse(rest[0]),

// will work (fn.length === 2)
data: (host, value) => {
  value = value ?? '[]';
  return JSON.parse(value);
},
```

### connect

```ts
connect: (host, key, invalidate) => () => { ... }
```

* **arguments**:
  * `host` - an element instance
  * `key` - the property name
  * `invalidate` - a callback to notify that the property value should be recalculated

Use the `connect` method to setup the property when the element is connected. To clean up the setup, return a `disconnect` function, where you can remove attached listeners etc.

> When you insert, remove, or relocate an element in the DOM tree, `connect` method and `disconnect` callback are called (by the `connectedCallback` and `disconnectedCallback` callbacks of the Custom Elements API).

```javascript
define({
  tag: "my-element",
  name: {
    value: () => api.get("some-external-value"),
    connect(host, key, invalidate) {
      // get the current value
      const value = host[key];
      ...

      // connect to external library and invalidate on change
      const subscription = api.subscribe(invalidate);

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

### observe

```ts
observe: (host, value, lastValue) => { ... }
```

* **arguments**:
  * `host` - an element instance
  * `value` - current value of the property
  * `lastValue` - last cached value of the property

Use the `observe` method for calling side effects, when the property value changes. The method is called asynchronously for the first time when the element is connected, and every time the property value changes.

> If the synchronous updates compensate, and the result value is the same as before, the function won't be called.

```javascript
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

### reflect

```ts
reflect: boolean | (value) => string
```

Use the `reflect` option to reflect back property value to the corresponding dashed-cased attribute. Set it to `true` or to a transform function. For example, you can use this feature to create CSS selectors in the Shadow DOM:

```javascript
define({
  tag: "my-element",
  isAdmin: { value: false, reflect: true },
  render: () => html``.css`
    :host([is-admin]) { background: yellow; }
  `,
});
```

## Rendering

The `render` property is reserved for the creating structure of the custom element. The `value` option must be a function, which returns a result of the call to the built-in template engine.

The library uses the `observe` pattern to call the function automatically when dependencies change. As the property resolves to the update function, it can also be called manually, by `el.render()`.

### Element's Content

By default `render` property creates and updates the content of the custom element:

```javascript
define({
  tag: "my-element",
  name: "",
  render: ({ name }) => html`<h1>Hello ${name}!</h1>`,
});
```

### Shadow DOM

If the root template of the element includes styles (`css` and `style` helpers, or `<style>` elements) or `<slot>` element, the library will render the content to the shadow DOM:

The template with styles:

```javascript
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

The template with `<slot>` element:

```javascript
define({
  tag: "my-element",
  render: () => html`
    <slot></slot>
  `,
});
```

Templates are compiled "just in time", so only the root template can be used to determine the rendering mode. If your nested template includes styles or slots, you must use the `shadow` option to force rendering in the Shadow DOM explicitly.

### Explicit Mode

Use the `shadow` option of the `render` property to set rendering mode to Shadow DOM or element's content:

```ts
// Disable Shadow DOM
render: {
  value: (host) => html`...`,
  shadow: false,
  ...
}

// Force Shadow DOM
render: {
  value: (host) => html`...`,
  shadow: true,
}
```

You can use this option for passing custom values to the `host.attachShadow()` method:

```javascript
import { define, html } from "hybrids";

define({
  tag: "my-element",
  render: {
    value: html`<div>...</div>`, 
    shadow: { mode: "close", delegatesFocus: true },
  },
});
```

### Reference Internals

The `render` property can be used to reference internals of the custom element. The DOM update process is asynchronous, so to avoid rendering timing issues, always use the property as a reference to the target element. If the property depending on `render` is called before the first update, the update will be triggered manually by calling the function.

```javascript
import { define, html } from "hybrids";

define({
  tag: "my-element",
  input: ({ render }) => render().querySelector("#input"),
  render: () => html`<input id="input" />`,
});
```

### Connect & Observe

You can setup property or call side effects when the element re-renders by using the `connect` and `observe` methods. Use full object descriptor with `value` option to define the function:

```javascript
define({
  tag: "my-element",
  render: {
    value: () => html`<h1>Hello!</h1>`,
    connect(host, key, invalidate) {
      console.log("connected");
      return () => console.log("disconnected");
    },
    observe(host) {
      console.log("rendered");
    },
  },
});
```

## Factories

The factory is a simple concept based on a function, which produces the property descriptor. The main goal of the factory is to hide implementation details and minimize redundant code. It allows you to reuse property behavior while giving you the ability to pass additional parameters

In most cases, descriptors are similar and have limited differences, so they can be parameterized by the function arguments. Also, the factory function can use the local scope for setting variables required for the feature.

> It is not required, but for better extendibility, the factory should return a full descriptor object

```javascript
import { define } from "hybrids";

function myCustomProperty(multiplier) {
  return {
    value: (host, value = 0) => value * multiplier;
  };
}

define({
  tag: "my-element",
  count: myCustomProperty(2),
});
```

The above `count` property is defined by the factory, which returns a property descriptor. In this case, its value is equal to the result of multiplying it by the `multiplier` argument.

More complex features provided by the library are defined as factories: [parent & children](./parent-children.md), [store](/store/overview.md) and [router](/router/overview.md).

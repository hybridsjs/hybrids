# Component Structure

The component definition is based on a plain object with a number of properties. The library checks the type of the property value to generate descriptors, which then are used in the custom element class definition. The values can be primitives, functions, or if you need a full control - object descriptors.

## Cache & Change Detection

The core idea of hybrid properties is its unique cache and change detection mechanism. It tracks dependencies between the properties (even between different custom elements) and notifies about changes. Still, the value of the property is only recalculated when it is accessed and the value of its dependencies has changed. If the property does not use other properties, it won't be recalculated, and the first cached value is always returned.

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

Use a primitive or `function` as a property value:

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

Writable properties use the corresponding dash-cased attribute for the initial value when the custom element is being created. Use the attributes only to define static values in the templates or the document, as attribute changes are not watched, and setting the attribute does not update the property.

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

The library follows the HTML standard when transforming attributes to the boolean type. An empty value of an existing attribute is interpreted as `true`. To set `false` via the attribute, you must not set the attribute at all. It means that if you want to support the boolean attribute, it is best to set the default value of the property to `false`.

For example, if you want to create an on/off switch, depending on the default value, create `on` or `off` property with `false` default value:

```html
<!-- off by default (on: false), set attribute to turn on -->
<my-element on></my-element>

<!-- on by default (off: false), set attribute to turn off -->
<my-element off></my-element>
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

If the descriptor `value` option is a primitive, undefined, null, or an object instance, the library creates a writable property with the defined default value. For primitives, the value type is protected and proper conversion is performed when a new value is set.

```javascript
define({
  tag: "my-element",
  firstName: "John",
  lastName: "Doe",
  isAdmin: false,
});
```

A default value as an object instance can only be set using the full object descriptor with the `value` option:

```javascript
define({
  tag: "my-element",
  data: { value: ['a', 'b', 'c'] },
});
```

The cache mechanism uses a strong equality check, so object instances for default values must be frozen during the compilation step of the component definition. Keep in mind that it might not be compatible with some external libraries that require mutable objects (you can use a computed property with a function, which returns a new object instance).

#### Function

```ts
value: (host) => { ... } | (host, value) => { ... }
```

* **arguments**:
  * `host` - an element instance
  * `value` - a value passed to assignment (e.g., `el.myProperty = 'new value'`)
* **returns**:
  * a value of the property

If the descriptor `value` option is a function, the library creates a property with a getter, and optionally with a setter (if the function has two arguments).

#### Readonly

If the function has only one argument, the property will be read-only, and the function is called with the element instance as the first argument:

```javascript
define({
  tag: "my-element",
  firstName: "John",
  lastName: "Doe",
  fullName: ({ firstName, lastName }) => `${firstName} ${lastName}`,
});
```

#### Writable

If the function has two arguments, the property will be writable. However, the function is called only when the value of the property is accessed (getter) - the assigned value is kept in the cache until the next access.

```javascript
define({
  tag: "my-element",
  data: (host, value) => value ? JSON.parse(value) : null,
});
```

The library uses `fn.length` to detect the number of arguments, so [default parameters](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/Default_parameters) and [rest parameters](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/rest_parameters) syntax cannot be used for the function arguments:

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

Use the `connect` method to set up the property when the element is connected. To clean up the setup, return a `disconnect` function, where you can remove attached listeners, etc.

> When you insert, remove, or relocate an element in the DOM tree, the `connect` method and `disconnect` callback are called (by the `connectedCallback` and `disconnectedCallback` callbacks of the Custom Elements API).

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

If third-party code is responsible for the property value, you can use the `invalidate` callback to notify that the value should be recalculated. For example, it can be used to connect to async web APIs or external libraries.

### observe

```ts
observe: (host, value, lastValue) => { ... }
```

* **arguments**:
  * `host` - an element instance
  * `value` - current value of the property
  * `lastValue` - last cached value of the property

Use the `observe` method for calling side effects when the property value changes. The method is called asynchronously for the first time when the element is connected, and every time the property value changes.

> If synchronous updates compensate and the resulting value is the same as before, the function won't be called.

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

Use the `reflect` option to reflect the property value back to the corresponding dash-cased attribute. Set it to `true` or to a transform function. For example, you can use this feature to create CSS selectors in the Shadow DOM:

```javascript
define({
  tag: "my-element",
  isAdmin: { value: false, reflect: true },
  render: () => html``.css`
    :host([is-admin]) { background: yellow; }
  `,
});
```

## Render

The `render` property is reserved for creating the structure of the custom element. The `value` option must be a function, which returns the result of a call to the built-in template engine.

The library uses the `observe` pattern to call the function automatically when dependencies change. As the property resolves to the update function, it can also be called manually via `el.render()`.

If the optional `shadow` option is not used, the library determines the rendering mode based on the root template structure. If the template includes styles (a `<style>` element, a `<link rel="stylesheet">`, or styles attached with the `css`/`style` helpers) or `<slot>` elements, the content is rendered to the Shadow DOM.

### Element's Content

By default `render` property creates and updates the contents of the custom element:

```javascript
define({
  tag: "my-element",
  name: "",
  render: ({ name }) => html`<h1>Hello ${name}!</h1>`,
});
```

```html
<my-element>
  <h1>Hello John!</h1>
</my-element>
```

### Shadow DOM

If the root template of the element includes styles or `<slot>` elements, the library renders the content to the Shadow DOM:

The template with inline styles:

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

```html
<my-element>
  #adopted-stylesheets
  #shadow-root
    <h1>Hello John!</h1>
</my-element>
```

The template with `<slot>` element:

```javascript
define({
  tag: "my-element",
  render: () => html`
    <div id="container">
      <slot></slot>
    </div>
  `,
});
```

```html
<my-element>
  #shadow-root
    <div id="container">
      <slot></slot>
    </div>
</my-element>
```

!> Only the root template can be used to determine the rendering mode implicitly. A nested template with styles does not force rendering in the Shadow DOM.

### Explicit Mode

Use the `shadow` option to force one of the rendering modes:

```ts
// Disable Shadow DOM (even if the template includes styles or slot elements)
render: {
  value: (host) => html`...`.css`...`,
  shadow: false,
  ...
}

// Force Shadow DOM
render: {
  value: (host) => html`...`,
  shadow: true,
}
```

#### Nested Templates

If only your nested template includes styles, you must use the `shadow` option to explicitly force rendering in the Shadow DOM:

```javascript
define({
  tag: "my-element",
  show: false,
  render: {
    value: ({ show }) => html`
      <div id="container">
        ${show && html`<slot></slot>`}
      </div>
    `,
    shadow: true,
  },
});
```

#### Shadow DOM Options

You can use the `shadow` option to pass custom arguments to the `host.attachShadow()` method:

```javascript
import { define, html } from "hybrids";

define({
  tag: "my-element",
  render: {
    value: () => html`<div>...</div>`,
    shadow: { mode: "closed", delegatesFocus: true },
  },
});
```

### Reference Internals

The `render` property can be used to reference internals of the custom element. The DOM update process is asynchronous, so to avoid rendering timing issues, always use the property as a reference to the target element. If a property depending on `render` is called before the first update, the update will be triggered manually by calling the function.

```javascript
import { define, html } from "hybrids";

define({
  tag: "my-element",
  input: ({ render }) => render().querySelector("#input"),
  render: () => html`<input id="input" />`,
});
```

### Connect & Observe

You can set up the property or call side effects when the element re-renders by using the `connect` and `observe` methods. Use the full object descriptor with the `value` option to define the function:

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

A factory is a simple concept based on a function that produces the property descriptor. The main goal of the factory is to hide implementation details and minimize redundant code. It allows you to reuse property behavior while giving you the ability to pass additional parameters.

In most cases, descriptors are similar and have limited differences, so they can be parameterized by the function arguments. Also, the factory function can use the local scope for setting variables required for the feature.

> It is not required, but for better extensibility, the factory should return a full descriptor object.

```javascript
import { define } from "hybrids";

function myCustomProperty(multiplier) {
  return {
    value: (host, value = 0) => value * multiplier,
  };
}

define({
  tag: "my-element",
  count: myCustomProperty(2),
});
```

The above `count` property is defined by the factory, which returns a property descriptor. In this case, its value is equal to the result of multiplying it by the `multiplier` argument.

More complex features provided by the library are defined as factories: [parent & children](./parent-children.md), [store](/store/usage.md), and [router](/router/usage.md).

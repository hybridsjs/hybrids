# Templates

The library provides `html` and `svg` functions for defining templates (both have the same interface, but `svg` uses the SVG namespace). They use the tagged template literals syntax to create the DOM and update dynamic parts, leaving static content untouched.

> For the best development experience, check whether your code editor supports highlighting HTML in tagged template literals.

## Usage

```typescript
html`<div property="${value}">${value}</div>` : Function
```

* **arguments**:
  * HTML content as a template content
  * `value` - dynamic values as a property values or element content
* **returns**:
  * an update function, which takes `host` and `target` arguments

```javascript
import { html } from 'hybrids';

const update = ({ value }) => html`
  <div>${value}</div>
`;
```

```typescript
svg`<circle property="${value}">${value}</circle>` : Function
```

* **arguments**:
  * SVG content as a template content
  * `value` - dynamic values as a property values or element content
* **returns**:
  * an update function, which takes `host` and `target` arguments

```javascript
import { html, svg } from 'hybrids';

const update = ({ radius }) => html`
  <svg viewBox="0 0 300 100">${
    svg`<circle cx="50" cy="50" r="${radius}" />`
  }</svg>
`;
```

The `<svg>` container element has to be created with the `html` function. Use the `svg` function only for creating the internal structure of the `<svg>` element.

## Properties & Attributes

```javascript
// el.propertyName = value, el.otherProperty = value
html`<my-element propertyName="${value}" other-property="${value}"></my-element>`;
```

An expression as the element's attribute content sets the corresponding existing case-sensitive property, the translated camelCased property, or falls back to the attribute value if the property is not found. This behavior maximizes compatibility with custom elements created outside of the library.

### Mixed Values

If the attribute value contains additional characters or multiple expressions, the attribute is always used with concatenated string value. It has precedence even over the special cases described below.

```javascript
html`<div id="el" class="button ${buttonType} ${buttonColor}"></div>`
```

### Special Cases

The default action for the `class` and `style` attributes would not work as expected, as they are implemented differently in the DOM. The `class` attribute reflects the `classList` and `className` properties. The `style` property returns a `CSSStyleDeclaration` rather than a simple string value. Because of that, the template engine supports them differently.

#### Class

The `class` attribute expression adds or removes class names from an element's `classList`. An expression can be a string, an array of strings, or a map of keys with boolean values:

```javascript
const name = 'one two';
const array = ['one', 'two'];
const map = { one: true, two: false };

html`<div class="${name || array || map}"></div>`;
```

#### Style

The `style` attribute expression sets style properties via the `CSSStyleDeclaration` API. An expression has to be an object with dashed or camelCase keys with values.

```javascript
const styles = {
  backgroundColor: 'red',
  'font-face': 'Arial',
};

html`<div style="${styles}"></div>`;
```

However, the preferred way to style elements is using the `<style>` element inside the template body. Read more in the [Styling](#styling) section.

## Event Listeners

An expression in an `on*` attribute resolves to an event listener set by `host.addEventListener(eventType, callback, options)`, with the part of the attribute after the `on` prefix as the event type (exact characters) and `options` set to `false`. The function returned by the expression is called as the event listener `callback`.

```javascript
function send(host, event) {
  event.preventDefault();

  // do something with value property
  sendData('api.com/create', { value: host.value });
}

define({
  tag: "my-element",
  value: 42,
  render: () => html`
    <form onsubmit="${send}">
      ...
    </form>
  `,
});
```

The first argument of the callback function is the custom element instance (the event target element is available at `event.target`). Access to the element in the render function is not required, so the callback can be defined as a pure function.

### Options

You can pass custom `options` to the `addEventListener` API by defining the `options` property of the function.

It can be a boolean value (it defaults to `false`):

```javascript
function onClick(host) {
  // do something
}
onClick.options = true; // capture mode

html`
  <div onclick="${onClick}">
    <button>...</button>
  </div>
`;
```

it can be an object:

```javascript
function onScroll(host) {
  // do something
}
onScroll.options = { passive: true }; // an object with characteristics

html`
  <div class="container" onscroll="${onScroll}">
    ...
  </div>
`;
```

Read [MDN documentation](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener) for all available values of the `options` argument.

### Form Elements

The template may contain built-in form elements or custom elements with a value, which should be bound to one of the host's properties.

You can create a callback manually for updating the host property value:

```javascript
function updateName(host, event) {
  host.name = event.target.value;
}

define({
  tag: "my-element",
  name: '',
  render: ({ name }) => html`
    <input type="text" defaultValue="${name}" oninput="${updateName}" />
    ...
  `,
});
```

Using the above pattern may become verbose if your template contains many values to bind. The engine provides the `html.set()` helper method, which generates a callback function for setting a host property from the value of the element or for setting a store model property value.

#### Property Name

```typescript
html.set(propertyName: string, value?: any): Function
```

* **arguments**:
  * `propertyName` - a target host property name
  * `value` - a custom value, which will be set instead of `event.target.value`
* **returns**:
  * a callback function compatible with template engine event listener

The `html.set()` supports generic elements and unique behavior of the form elements:

* For `<input type="radio">` and `<input type="checkbox">`, the value is related to its `checked` value
* For `<input type="file">`, `event.target.files` is used instead of `event.target.value`
* For the remaining elements, it uses `event.detail.value` if defined, or `target.value` as the default

```javascript
define({
  tag: "my-element",
  option: false,
  date: null,
  render: ({ option, date }) => html`
    <input type="checkbox" checked="${option}" onchange="${html.set("option")}" />

    <!-- updates "host.date" with "value" property from the element -->
    <my-date-picker value="${date}" onchange="${html.set("date")}"></my-date-picker>

    <!-- updates "host.option" with "event.detail.value" from the element -->
    <paper-toggle-button onchecked-changed="${html.set("option")}"></paper-toggle-button>
  `,
});
```

#### Custom Value

You can overwrite the default behavior and pass a custom value as a second parameter (`event.target.value` is not used):

```javascript
define({
  tag: "my-element",
  items: [{ value: 1 }, { value: 2}],
  selected: null,
  render: ({ items }) => html`
    <ul>
      ${items.map(item => html`
        <li>
          <span>value: ${item.value}</span>
          <button onclick="${html.set('selected', item)}">select item!</button>
        </li>
      `)}
    </ul>
  `,
});
```

In the above example, when a user clicks on the item button, the `selected` property is set to `item` from the loop.

#### Store Model

```typescript
html.set(model: object, propertyPath: string | null): Function
```

* **arguments**:
  * `model` - a [store](../store/usage.md) model instance
  * `propertyPath`
    * a `string` path to the property of the model, usually a single name, like `"firstName"`; for a nested property use dot notation, for example `"address.street"`
    * use `null` for model deletion, like `html.set(user, null)`
* **returns**:
  * a callback function compatible with template engine event listener

```javascript
import { store } from "hybrids";
import User from "./models.js";

define({
  tag: "my-element",
  user: store(User, { id: "userId", draft: true }),
  render: ({ user }) => html`
    <input
      value="${user.firstName}"
      oninput="${html.set(user, "firstName")}"
    />
    <input
      value="${user.address.street}"
      oninput="${html.set(user, "address.street")}"
    />

    ...

    <button onclick="${html.set(user, null)}">Delete user</button>
  `,
});
```

## Values

An expression in the content of an element that is not a function or a Node instance resolves to `textContent`. Falsy values other than the number `0` are not displayed (`textContent` is set to an empty string). These rules apply in the same way to values in arrays.

```javascript
html`<div>Name: ${name}, Count: ${count}</div>`;
```

HTML code can be created via the `innerHTML` property. However, use it with caution, as it might open up an XSS attack:

```javascript
// Use it with caution, it might open up an XSS attack
html`<div innerHTML="${htmlCode}"></div>`;
```

An expression with a function resolves to a [nested template](#nested-templates).

### Nodes

If the expression returns a Node instance, it is attached to the corresponding place in the DOM. It can be useful for web components that require a reference to inner DOM elements:

```javascript
define({
  tag: "my-element",
  // it will be called only once, as it has no deps
  canvas: () => { 
    const el = document.createElement("canvas");

    // setup canvas
    const context = el.getContext('2d');
    context.fillStyle = "rgb(255,0,0)";
    context.fillRect(30, 30, 50, 50);

    // return element
    return el;
  },
  render: ({ canvas }) => html`
    <div id="container">
      ${canvas}
    </div>
  `,
});
```

### Promises

A Promise as a value of an expression is not supported. However, the template engine supports promises via the `html.resolve` method.

```typescript
html.resolve(promise: Promise, placeholder: Function, delay = 200): Function
```

* **arguments**:
  * `promise` - a promise, which should resolve to the content expression value
  * `placeholder` - an update function that renders content until the promise is resolved or rejected
  * `delay` - delay in milliseconds after which the placeholder is rendered
* **returns**:
  * update function compatible with content expression

```javascript
const promise = asyncApi().then(...);

html`
  <div>
    ${html.resolve(
      promise
        .then((value) => html`<div>${value}</div>`)
        .catch(() => html`<div>Error!</div>`),
      html`Loading...`,
    )}
  </div>
`
```

## Conditions

For conditional rendering, expressions can return falsy values (the exception is number `0`) to clear previously rendered content.

```javascript
html`<div>${isValid && ...}</div>`;
```

## Iteration

For iteration, an expression should return an `array` with a list of expressions. Items can be primitive values, nested templates, or nested arrays.

```javascript
html`
  <todo-list>
    ${names.map((name) => `Name: ${name}`)}

    ${items.map(({ name }) => html`<todo-item>${name}</todo-item>`)}
  </todo-list>
`;
```

### Keys

By default, the array `index` identifies expressions for re-render. However, you can use the `key` method provided by the result of the `html` call for efficient re-ordering (it sets a key and returns the update function). When the list changes and a key is found, the existing template is updated rather than a new one being created.

```javascript
html`
  <todo-list>
    ${items.map(({ id, name }) => 
      html`<todo-item>${name}</todo-item>`.key(id),
    )}
  </todo-list>
`
```

## Nested Templates

Expressions in the body of an element can return a function that takes two arguments - `host` and `target` (a text node position marker). The update function returned by `html` is compatible with this API, and it can be used to create nested templates.

```javascript
const submit = (fn) => html`
  <button type="submit" onclick=${fn}>Submit</button>
`;

function myCallback(host, event) {...}

html`
  <form>
    ...
    ${submit(myCallback)}
  </form>
`;
```

In the above example, the `submit` function creates a template with an `fn` callback. The main template can use this function in an expression with a custom callback. If so, the nested template with a button is rendered inside the form element.

The child template propagates the element instance context from the parent. The `host` argument of `myCallback` is the same as it would be with a function used directly in the main template.

## Styling

To style template content, you can create `<style>` elements directly in the template, or pass the content of the CSS.

### CSS Content

The preferred way to add styles is to use the `css` helper from the result of the `html` or `svg` function:

```typescript
html`...`.css`div { color: ${value}; }`: Function
```

* **arguments**:
  * CSS content in tagged template literals
  * `value` - dynamic values concatenated with the template literal
* **returns**:
  * an update function compatible with content expression

```javascript
define({
  tag: "my-element",
  render: () => html`
    <div>...</div>
  `.css`
    div { color: red }
  `,
});
```

It is the most performant way: if Constructable Stylesheets are supported (currently, only Safari does not yet support them), the generated CSS is shared between all elements with the same style.

For CSS content generated outside of the template, use the `style` helper method:

```typescript
html`...`.style(...styles: Array<string | CSSStyleSheet>): Function
```

* **arguments**:
  * `styles` - a list of text contents of CSS stylesheets, or instances of `CSSStyleSheet` (only for constructable stylesheets)
* **returns**:
  * an update function compatible with content expression

```javascript
// `globals` and `styles` should contain text content of the CSS
// importing `.css` files requires a bundler feature, e.g. Vite
import globals from '../globals.css';
import styles from './MyElement.css';

// using style helper
const inlineStyles = `
  div { color: red }
`;

define({
  tag: "my-element",
  render: () => html`
    <div>...</div>
  `.style(globals, styles, inlineStyles),
});
```

#### Constructable Stylesheets

If the browser supports [Constructable Stylesheets](https://wicg.github.io/construct-stylesheets/) and the following conditions are met, the style helper creates and adopts a list of `CSSStyleSheet` instances instead of creating `<style>` tag:

* The CSS content must not include `@import` statement (it was recently [deprecated](https://github.com/WICG/construct-stylesheets/issues/119#issuecomment-588352418) for Constructable Stylesheets)
* The `html``.style()` helper must be called for the root template of the custom element (it fallbacks to `<style>` element for nested templates)

For string input, the template engine creates an instance of `CSSStyleSheet` only once and shares it among all instances of the custom element (you can also pass a `CSSStyleSheet` instance, but then you must take care of browser support yourself).

The style helper supports passing a `CSSStyleSheet` instance, but it will only work in the mode described above. Do not use it if you target multiple environments where it might not yet be supported.

### Style Element

Create a `<style>` element inside the main template using the Shadow DOM:

```javascript
define({
  tag: "my-element",
  render: () => html`
    <div>...</div>
    <style>
      div { color: red }
    </style>
  `,
});
```

## Plugins

The template engine's `html` and `svg` functions return an update function, which is later called with proper arguments by the library (when used in the `render` property). If you need more control over the update process, you can use a custom function that internally uses the result of the `html` or `svg` function.

```javascript
function myPlugin(fn) {
  return (host, target) => {
    // do something when library calls the update function
    // ...

    // Call the original update function from compiled template
    fn(host, target);
  };
}

define({
  tag: "my-element",
  render: () => myPlugin(html`<div>...</div>`),
})
```

For simpler syntax, you can use the `.use()` helper method. It can be chained, so a list of plugins will be applied in order.

```typescript
html`...`.use(plugin: (fn: ((host, target) => void) => (host, target) => void): Function
```

* **arguments**:
  * `plugin` - a function, which takes the original update function and returns a new update function
* **returns**:
  * an update function compatible with content expression

```javascript
define({
  tag: "my-element",
  render: () => html`
    <div>...</div>
  `.use(myPlugin),
});
```

### Transition API

The built-in `html.transition` plugin uses the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API). It works best with whole-viewport transitions, like app-style navigation events, but it can be used for any other transition as well. The API must be attached to only one element in the DOM tree, so it is recommended to use it with the root element of the application (which is always attached to the DOM):

```javascript
define({
  tag: 'my-app',
  stack: router([Home]),
  render: ({ stack }) => html`
    <header>...</header>
    <main>${stack}</main>
    ...
  `.use(html.transition),
});
```

!> The transition API will only be triggered when an element that uses `html.transition` updates. In the above example, it will be triggered only when the `stack` property changes. Any change to internal elements of the `stack` will not trigger the transition.

The transition API can be customized via CSS properties. DOM elements can have custom view transition names. The [layout engine](./layout-engine.md) supports the `view` rule, which sets it:

```javascript
export default define({
  tag: 'my-app-home',
  render: () => html`
    <template layout="column">
      ...
      <div layout="view:card"></div>
    </template>
  `,
});
```

## Limitations

The engine tries to support all required features for creating rich HTML templates, but there are a few cases where expressions cannot be used or have some limitations.

### Table Family Elements

`<table>`, `<tr>`, `<thead>`, `<tbody>`, `<tfoot>` and `<colgroup>` elements with expressions should not have additional text other than a whitespace:

##### Breaks template: <!-- omit in toc -->

```javascript
html`<tr>${cellOne} ${cellTwo} some text</tr>`;
```

##### Works fine: <!-- omit in toc -->

```javascript
html`<tr>${cellOne} ${cellTwo}</tr>`;
```

### Template Element

Expressions inside the `<template>` element are not supported:

##### Breaks template: <!-- omit in toc -->

```javascript
html`
  <custom-element>
    <template>
      <div class="${myClass}"></div>
    </template>
    <div>${content}</div>
  </custom-element>
`;
```

##### Works fine: <!-- omit in toc -->

```javascript
html`
  <custom-element>
    <template>
      <div class="my-static-class"></div>
    </template>
    <div>${content}</div>
  </custom-element>
`;
```

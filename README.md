<h1 align="center">
  <img src="docs/assets/hybrids-logo.svg" width="250">
  <br/>
  hybrids
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/hybrids"><img src="https://img.shields.io/npm/v/hybrids.svg?style=flat" alt="npm version"/></a>
  <a href="https://www.npmjs.com/package/hybrids"><img src="https://img.shields.io/bundlephobia/minzip/hybrids.svg?label=minzip" alt="bundle size"/></a>
  <a href="https://gitter.im/hybridsjs/hybrids"><img src="https://img.shields.io/gitter/room/nwjs/nw.js.svg?colorB=893F77" alt="gitter"></a>
  <a href="https://twitter.com/hybridsjs"><img src="https://img.shields.io/badge/follow-on%20twitter-4AA1EC.svg" alt="twitter"></a>
  <a href="https://travis-ci.org/hybridsjs/hybrids"><img src="https://img.shields.io/travis/hybridsjs/hybrids.svg?style=flat" alt="Build Status"/></a>
  <a href="https://coveralls.io/github/hybridsjs/hybrids?branch=master"><img src="https://img.shields.io/coveralls/github/hybridsjs/hybrids.svg?style=flat" alt="Coverage Status"/></a>
  <a href="https://conventionalcommits.org"><img src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg" alt="Conventional Commits"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/hybrids.svg" alt="license"/></a>
</p>

<p align="center">
  UI library for creating <a href="https://www.webcomponents.org/">Web Components</a> with simple and functional API
</p>

<p align="center">
  <a href="https://stackblitz.com/edit/hybrids-simple-counter?file=simple-counter.js" alt="Edit Simple Counter">
    <img src="docs/assets/simple-counter.png" width="600"></a>
</p>


## 🏆 Key Features <!-- omit in toc -->

* **The Simplest Definition**. Rather than using `class` and `this` syntax, the library uses plain objects with property descriptors and pure functions for defining custom elements.
* **Composition over the Inheritance**. Property descriptors can be re-used, merged, split and many more (for example using object rest/spread properties).
* **No Global Lifecycle Callbacks**. The library says no to `will` and `did` - properties are independent and have own `connect` and `disconnect` callbacks in the definition.
* **Memoized Property Value**. Property value is cached by default and recalculated only when related properties change, which makes the library super fast!
* **Template as You Always Wanted**. The library uses tagged template literals to give you all the power to create rich views with JavaScript expressions.
* **Integration with Developer Tools**. The library supports **Hot Module Replacement** - custom elements can be live updated without the need to refresh the page.

## 🕹 Live Examples <!-- omit in toc -->

Live examples of the custom elements built with the `hybrids` library:

* [`<simple-counter>` - custom element with a button for changing own state](https://stackblitz.com/edit/hybrids-simple-counter?file=simple-counter.js) 
* [`<redux-counter>` - custom element using `Redux` library for state management](https://stackblitz.com/edit/hybrids-redux-counter?file=redux-counter.js)
* [`<react-counter>` - custom element using `render` factory and `React` library for rendering in shadow DOM](https://stackblitz.com/edit/hybrids-react-counter?file=react-counter.js)
* [`<app-todos>` - todo list using `parent` factory for state management](https://stackblitz.com/edit/hybrids-parent-factory?file=index.js)
* [`<tab-group>` - switching tabs using `children` factory](https://stackblitz.com/edit/hybrids-children-factory?file=index.js)

> Playground powered by ⚡StackBlitz

## 📚 Documentation <!-- omit in toc -->
- [💡 Installation](#-installation)
- [📱 Browser Support](#-browser-support)
- [🏗 Custom Element Definition](#-custom-element-definition)
- [📝 Property Descriptors](#-property-descriptors)
- [🏭 Factories](#-factories)
  - [Property](#property)
  - [Parent & Children](#parent--children)
  - [Render](#render)
- [🎨 Templates](#-templates)
  - [Properties & Attributes](#properties--attributes)
  - [Event Listeners](#event-listeners)
  - [Values](#values)
  - [Conditions](#conditions)
  - [Nested Templates](#nested-templates)
  - [Arrays](#arrays)
  - [Promises](#promises)
  - [Resolving Dependencies](#resolving-dependencies)
  - [Limitations](#limitations)
- [⚙️ Utils](#️-utils)
- [📃 License](#-license)

## 💡 Installation

The recommended way is to use the `npm` registry:
```bash
npm install hybrids
# or
yarn add hybrids
```

You can also use the built version of the library (with `hybrids` global namespace): 
```html
<script src="https://unpkg.com/hybrids/dist/hybrids.js"></script>
```

> ⚠️ For the built version all name exports are available on the `hybrids` global namespace.

## 📱 Browser Support

[![Build Status](https://saucelabs.com/browser-matrix/hybrids.svg)](https://saucelabs.com/u/hybrids)

The library requires some of the ES2015 APIs and [Shadow DOM](https://w3c.github.io/webcomponents/spec/shadow/), [Custom Elements](https://www.w3.org/TR/custom-elements/), and [Template](https://www.w3.org/TR/html-templates/) specifications. You can use `hybrids` in all evergreen browsers and IE11 including a list of required polyfills and shims. The easiest way is to add the following code on top of your project:

```javascript
// ES2015 selected APIs polyfills loaded in IE11
// Web Components shims and polyfills loaded if needed (external packages)
import 'hybrids/shim'; 
...
```

Web components shims have some limitations. Especially, [`webcomponents/shadycss`](https://github.com/webcomponents/shadycss) approximates CSS scoping and CSS custom properties inheritance. Read more on the [known issues](https://github.com/webcomponents/webcomponentsjs#known-issues) and [custom properties shim limitations](https://www.polymer-project.org/3.0/docs/devguide/custom-css-properties#custom-properties-shim-limitations) pages.

> ⚠️ The library calls shims if they are needed, so direct use is not required.

## 🏗 Custom Element Definition

Custom element definition works in two modes. In the first mode, `define` method takes tag name and plain object with a map of property descriptors. In the second mode, `define` takes a map of descriptors. 

During the definition process, it creates `Wrapper` constructor for one or more configurations, applies properties on the `Wrapper.prototype` and defines custom elements using `customElements.define()` method.

> ⚠️ To simplify using external custom elements with those created by the library, you can pass `constructor` instead of a plain object with property descriptors. Then `define` works exactly the same as the `customElements.define()` method.

------------------------

#### `define(tagName: string, descriptorsOrConstructor: Object | Function): Wrapper` <!-- omit in toc -->

* **arguments**:
  * `tagName` - a custom element tag name,
  * `descriptorsOrConstructor` - an object with a map of hybrid property descriptors or constructor
* **returns**: 
  * `Wrapper` - custom element constructor (extends `HTMLElement`)

```javascript
import { define } from 'hybrids';

// Define one element with explicit tag name
define('my-element', MyElement);
```

------------------------

#### `define({ tagName: descriptorsOrConstructor, ... }): { tagName: Wrapper, ... }` <!-- omit in toc -->

* **arguments**:
  * `tagName` - a custom element tag name in pascal case or camel case,
  * `descriptorsOrConstructor` - an object with a map of hybrid property descriptors or constructor
* **returns**: 
  * `{ tagName: Wrapper, ...}` - a map of custom element constructors (extends `HTMLElement`)

```javascript
import { define } from 'hybrids';
import { MyElement, OtherElement } from 'some-elements';

// Define one or more elements
define({ MyElement, OtherElement, ... });
```

## 📝 Property Descriptors

The following code shows a complete structure of the property descriptor: 
```javascript
const MyElement = {
  propertyName: {
    get: (host, lastValue) => { ... },
    set: (host, value, lastValue) => { ... },
    connect: (host, key, invalidate) => {
      ...
      return () => { ... }; // disconnect
    },
  },
};
```

One of the `get` or `set` method has to be defined, `connect` method can be omitted. If only `set` method is defined, for `get` method a default getter is used, which returns last cached value.

------------------------

#### `get: (host: Element, lastValue: any) => { ... }` <!-- omit in toc -->

* **arguments**:
  * `host` - an element instance
  * `lastValue` - last cached value of the property
* **returns (required)**:
  * `value` - a value of the current state of the property

Value of the property is cached by default. `get` method is called only if other hybrid properties used in the body of the getter function have changed. For example, in the following code, `name` property getter is only called again if `firstName` or `lastName` has changed:

```javascript
const MyElement = {
  firstName: 'John',
  lastName: 'Smith',
  name: ({ firstName, lastName }) => `${firstName} ${lastName}`,
};
```
> ⚠️ This example uses [property translation](#property-translation) - `name` property is translated to `get` method of the property descriptor.

------------------------

#### `set: (host: Element, value: any, lastValue: any) => {...}` <!-- omit in toc -->

* **arguments**:
  * `host` - an element instance
  * `value` - a value passed to assertion (ex., `el.myProperty = 'new value'`)
  * `lastValue` - a last cached value of the property
* **returns (required)**: 
  * `nextValue` - a value of the property, which replaces cached value

`set` method is called within every assertion of the property. The cached value is invalidated if returned `nextValue` is not equal to `lastValue` (`nextValue !== lastValue`). However, `get` method is called in the next get call of the property (it is not recalculated after invalidation). Nonprimitive values should be treated as immutable - property is invalidated only if value reference has changed.

------------------------

#### `connect: (host: Element, key: string, invalidate: Function) => { ... }` <!-- omit in toc -->

* **arguments**:
  * `host` - an element instance
  * `key` - a property key name
  * `invalidate` - a callback function, which invalidates cached value
* **returns (not required):**
  * `disconnect` - a function (without arguments)

`connect` method is called synchronously in the `connectedCallback` of the custom element. Similarly, returned `disconnect` function is called in the `disconnectedCallback`.

`invalidate` callback function forces property value recalculation. It can be used to connect to async web APIs or external libraries.

🕹 [Click and play with a live example of `redux` integration](https://stackblitz.com/edit/hybrids-redux-counter?file=redux-counter.js)

> ⚠️ Invalidate (explicit or by the assertion) dispatches `@invalidate` custom event (composed and bubbling), which allows observing element's hybrid properties.

------------------------

### Property Translation<!-- omit in toc -->

Using property descriptor structure for defining hybrid properties is usually not required because `define` method translates values to built-in factory functions or to property descriptors. Translation is done in the following order:

1. Property with `render` key and value set as a function translates to render factory:
    ```javascript
    import { render } from 'hybrids';

    { render: () => { ... } }
    // Translates to:
    { render: render(() => {...}) }
    ```
2. Property with value set as a function translates to descriptor with get method:
    ```javascript
    { propertyName: () => {...} }
    // Translates to:
    { propertyName: { get: () => {...} } }
    ```
3. Property with value set as a primitive translates to property factory:
    ```javascript
    import { property } from 'hybrids';

    { propertyName: 'text' } // String, Number, Boolean, ...
    // Translates to:
    { propertyName: property('text') }
    ```
4. Property with value set as an object without `get` and `set` properties translates to property factory:
    ```javascript
    import { property } from 'hybrids';

    { propertyName: [] }
    // Translates to:
    { propertyName: property([]) }
    ```

Object descriptor passed to the `define` method is not changed and it stays as it was defined. It means, that custom element definition can be just a simple structure of default values and methods without external dependencies.

## 🏭 Factories

The factory is a function, which produces property descriptor. Rather than explicitly describe a property, factories hide implementation details and minimize redundant code. `hybrids` includes four factories, which cover the most important features for creating custom elements.

### Property

#### `property(defaultValue: any, [connect: Function]): Object` <!-- omit in toc -->

* **arguments**:
  * `defaultValue` - any value
  * `connect` - a connect callback function of the property descriptor
* **returns**:
  * a property descriptor, which resolves to value

`property` creates property binding with fallback to corresponding element's attribute. `property` uses a transform function, which ensures the strict type of the value set by an attribute or a property.

Type of the passed `defaultValue` is used to detect transform function. For example, when `defaultValue` is set to `"text"`, `String` function is used. `defaultValue` can be a transform function itself, which is called when a property value is set.

#### Transform Matching Types <!-- omit in toc -->

* `string` -> `String(value)`
* `number` -> `Number(value)`
* `boolean` -> `Boolean(value)`
* `function` -> `defaultValue(value)`
* `object` -> `Object.freeze(value)`
* `undefined` -> `value`

Object values are frozen to prevent mutation of the own properties, which does not invalidate cached value. Moreover, `defaultValue` is shared between custom element instances, so it should not be changed by any of them.

To omit transform, `defaultValue` has to be set to `undefined`.

The following example uses `moment` library as a function for `defaultValue` to transform `date` property value:

```javascript
import moment from 'moment';
import { property } from 'hybrids';

const MyElement = {
  date: property(moment),
};
```

> Possible usage in html (tag name can be different):

```html
<my-element date="2018-01-01"></my-element>
```

#### Attribute Fallback <!-- omit in toc -->

All transform matching types except `object` and `undefined` create a fallback connection to element attribute (dashed name of the property key). An attribute value is used **only once when an element is connected for the first time to the document**. It means, that attributes can be used only to set static values in HTML templates. Only properties can be used to dynamically update values. 

The library follows HTML specification and properly transforms attribute to `boolean` and `string` values.

### Parent & Children

Rather than using custom element tag name, access to parent or children elements is set by the reference to an object containing hybrid property descriptors. This feature allows avoiding name collision between custom elements because it is irrelevant on what name related custom element is defined.

> ⚠️ Binding can be created only between custom elements defined by the library. Built-in elements or other custom elements are not supported.

------------------------

#### `parent(hybridsOrFn: Object | Function: (hybrids) => {...}: Boolean): Object`  <!-- omit in toc -->

* **arguments**:
  * `hybridsOrFn` - reference to an object containing property descriptors or a function, which should return `true` when current `hybrids` meets the condition
* **returns**: 
  * a property descriptor, which resolves to `null` or `Element` instance 

`parent` creates a binding with a custom element (defined with `hybrids`) in upper DOM tree up to `document.body` level (crossing Shadow DOM boundary). The binding is set and updated when the custom element is connected and disconnected.

Resolved parent custom element can be safely used in other hybrid properties. If parent hybrid property invalidates, the value of a related property is invalidated as well.

In the following example, `label` relates to `count` property of the `AppStore`. The value of `label` is invalidated and recalculated when `count` changes:

```javascript
import { parent } from 'hybrids';

const AppStore = {
  count: 0,
};

const MyElement = {
  store: parent(AppStore),
  label: ({ store: { count } }) => `store count: ${count}`,
}
```

> Possible usage in html (tag names can be different):

```html
<app-store count="42">
  <my-element></my-element>
</app-store>
```

🕹 [Click and play with a live example using `parent` factory](https://stackblitz.com/edit/hybrids-parent-factory?file=index.js)

#### Complex Conditions <!-- omit in toc -->

Use a `function` as an argument for complex conditions. For example, you can check if a part of the hybrids contains specific property, or you can use it for self reference - looking for a parent, which is an element with the same definition.

```javascript
const MyElement = {
  property: parent(hybrids => hybrids === MyElement),
};
```

------------------------

#### `children(hybridsOrFn: Object | Function: (hybrids) => {...}: Boolean, [options: Object]): Object`  <!-- omit in toc -->

* **arguments**:
  * `hybridsOrFn` - reference to an object containing property descriptors or a function, which should return `true` when current `hybrids` meets the condition
  * `options` - object with available keys:
    * `deep` - boolean, defaults to `false`
    * `nested` - boolean, defaults to `false`
* **returns**:
  * hybrid property descriptor, which resolves to `array` of `Element` instances

`children` creates a binding with children elements (only in light DOM). Without options, only direct children of the element are on the list. `deep` option allows traversing
deeper children. `nested` option allows adding element and children of that element if the condition is met (`nested` option works only with turn on `deep` option).

In the same way as `parent` factory works, `children` binding invalidates properties when a hybrid property of one of the resolved custom elements is used. 

```javascript
import { children } from 'hybrids';

const TabItem = {
  name: '',
  active: false,
  ...
};

const TabGroup = {
  tabs: children(TabItem),
  active: ({ tabs }) => tabs.find((tab) => tab.active),
  ...
};
```

> Possible usage in html (tag names can be different):

```html
<tab-group>
  <tab-item name="one"></tab-item>
  <tab-item name="two" active></tab-item>
</tab-group>
```

🕹 [Click and play with a live example using `children` factory](https://stackblitz.com/edit/hybrids-children-factory?file=index.js)

#### Complex Conditions <!-- omit in toc -->

Use a `function` as an argument for complex conditions. For example, you can check if a part of the hybrids contains specific property, or you can use it for self reference - looking for children, which are elements with the same definition.

```javascript
const MyElement = {
  property: children(hybrids => hybrids === MyElement),
};
```

------------------------

### Render

#### `render(fn: Function, options: Object = { shadowRoot: true }): Object`  <!-- omit in toc -->

* **arguments**:
  * `fn(host: Element): Function` - callback function with `host` argument; returned function have `host` and `target` arguments
  * `options: Object` - an object, which has a following structure:
    * `{ shadowRoot: true }` (default value) - initializes Shadow DOM and set `target` as `shadowRoot`
    * `{ shadowRoot: false }` - sets `target` argument as `host`,
    * `{ shadowRoot: { extraOption: true, ... } }` - initializes Shadow DOM with passed options for `attachShadow()` method
* **returns**:
  * hybrid property descriptor, which resolves to a function

`render` adds update function to the global render scheduler. Also, it initializes `shadowRoot` for the element and passes it as `target` argument to the update function. Shadow DOM can be disabled if `options` object is passed with `shadowRoot` set to `false`. Then, `target` argument is a `host`.

`fn` should return function for updating DOM. The preferred way is to use the template engine from the library, but it can be used with any external UI library, that renders DOM.



```javascript
import { render, html } from 'hybrids';

// html template, shadowRoot enabled (default)
const UsingTemplate = {
  customRender: render((host) => {
    return html`
      <div>...</div>
    `;
  }),
}

// Custom update function, shadowRoot disabled
const CustomUpdate = {
  customRender: render((host) => {
    return (host, target) => {
      // Update target here
    };
  }, { shadowRoot: false }),
};
```

🕹 [Click and play with a live example using `render` factory and  `React` library](https://stackblitz.com/edit/hybrids-react-counter?file=react-counter.js)

Usually, direct usage of the `render` factory is not required because of property translation feature. If you want to use Shadow DOM and `render` key, you can define your component just like this:

```javascript
import { html } from 'hybrids';

const MyElement = {
  value: 1,
  render: ({ value }) => html`
    <div>${value}</div>
  `,
};
```

#### Update Mechanism <!-- omit in toc -->

Updates are scheduled with `requestAnimationFrame()` API triggered by `@invalidate` event listener. For example, the view is updated when one of the hybrid property used in `fn` changes. However, if execution of the update function passes ~16ms threshold (it counts from the beginning of the schedule), the following elements in the queue are updated with next `requestAnimationFrame()`.

`render` factory ensures update after invalidation of hybrid property, but it is possible to trigger an update by calling property manually on the element instance.

```javascript
const myElement = document.getElementsByTagName('my-element')[0];
myElement.render();
```

> ⚠️ Property defined with `render` factory uses the same cache mechanism like other hybrid properties. It means that `fn` is only called if hybrid properties invalidate.

## 🎨 Templates

The main concept is inspired by the [`lit-html`](https://github.com/Polymer/lit-html), but the implementation is different and follows own conventions. The library provides `html` and `svg` functions for creating templates (both have the same interface, but `svg` uses SVG namespace). They use tagged template literals syntax to create  DOM and update dynamic parts leaving static content untouched.

> ️❤️ For the best development experience, check if your code editor supports highlighting HTML in tagged template literals

### Properties & Attributes

```javascript
html`<div propertyName="${value}"></div>`;
```

Attribute expression set a case-sensitive property of element instance (if it has that property in `prototype`) with fallback to attribute. There are two exceptions, where it works differently.

#### Class <!-- omit in toc -->

`class` attribute expression adds or removes a class from an element's `classList`. An expression can be a string, an array of strings or a map of keys with boolean values.

```javascript
const name = 'one two';
const array = ['one', 'two'];
const map = { one: true, two: false };

html`<div class="${name || array || map}"></div>`;
```

#### Style <!-- omit in toc -->

`style` attribute expression set style properties by the `CSSStyleDeclaration` API. An expression has to be an object with dashed or camel-case keys with values.

```javascript
const styles = {
  backgroundColor: 'red',
  'font-face': 'Arial',
};

html`<div style="${styles}"></div>`;
```

However, the preferred way to style elements is using `<style>` element inside of the template body:

```javascript
const MyElement = {
  render: () => html`
    <style>
      div { background-color: red }
    </style>
    <div>...</div>
  `,
};
```

#### Mixed Values <!-- omit in toc -->

Attribute expression with other text resolves to `string` attribute value:

```javascript
html`<div class="button ${buttonType} ${buttonColor}"></div>`
```

### Event Listeners

`on*` attribute expression resolves to event listener set by the `addEventListener` API. The part of the attribute after `on` prefix is used as an event type. The function returned by the expression is called in an event listener callback.

```javascript
function send(host, event) {
  // do something with value
}

const MyElement = {
  value: 42,
  render: () => html`
    <button onclick="${send}">Send</button>
  `,
};
```

`host` references to custom element instance (target element is available at `event.target`). The scope of the render function is not required, so a callback can be defined as a pure function.

### Values

`string`, `number` and `object` value resolves to `textContent` (HTML can be set by the `innerHTML` property).

```javascript
html`<div>Name: ${name}, Count: ${count}</div>`;

// Use it with caution, it might open XSS attack
html`<div innerHTML="${htmlCode}"></div>`;
```

### Conditions

Falsy expression removes previous truthy value from DOM and renders nothing (the exception is number `0`).

```javascript
html`<div>${isValid && ...}</div>`;
```

### Nested Templates

An expression can return a function, which takes two arguments: `host` and `target` (text node position marker). Update function returned by the `html` is compatible with this API and it can create nested templates.

```javascript
const submit = (fn) => html`
  <button onclick=${fn}>Submit</button>
`;

function myCallback(host, event) {...}

html`
  <form>
    ...
    ${submit(myCallback)}
  </form>
`;
```

In above example `submit` factory function returns an update function created by the `html`. The context is propagated, so `fn` callback will get the same `host` argument as the main template.

### Arrays

For iteration, an expression should return  `array` with a list of content expressions. Items can be primitive values, nested templates as well as nested arrays.

```javascript
html`
  <todo-list>
    ${names.map((name) => `Name: ${name}`)}

    ${items.map(({ id, name }) => 
      html`<todo-item>${name}</todo-item>`.key(id)
    )}
  </todo-list>
`;
```

Array `index` identifies rendered expressions. For efficient re-order use `html` function and set iteration key by `key` method on returned update function (it sets key and returns update function).

```javascript
html`...`.key(id)
```

### Promises

Promises as a value of the expression are not supported, but the library support them by the `html.resolve` method.

#### `html.resolve(promise, placeholder, delay = 200)` <!-- omit in toc -->

* **arguments**:
  * `promise` - promise, which should resolve/reject update function
  * `placeholder` - update function for render content until promise is resolved or rejected
  * `delay` - delay in milliseconds, after which placeholder is rendered 
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

### Resolving Dependencies

For templates, which use other custom elements, update function provides helper method for resolving dependencies dynamically. It uses `define` method, so its API is the same as explained in the first section of the documentation. However, to work with templates it returns template update function.

This method helps to avoid defining unused elements and allows creating a tree-like dependency structure. A complex structure may require only one explicit definition at the root level. As the library factories decouple tag name from the definition, elements can be set with custom names.

> ⚠️ In the future, when scoped [custom element registers](https://github.com/w3c/webcomponents/issues/716) will be available, `define` helper will benefit from that feature and register elements in the `host` element scope.

#### `` html`...`.define(map: Object) `` <!-- omit in toc -->

* **arguments**:
  * `map` - object with hybrids definitions or custom element's constructors
* **returns**:
  * update function compatible with content expression 

```javascript
import UiHeader from './UiHeader';

const UiCard = {
  ...,
  render: ({ withHeader }) => html`
    <div>
      ${withHeader && html`
        <ui-header>...</ui-header>
      `.define({ UiHeader })}
      ...
    </div>
  `,
};
```

In above example, the customer of the `UiCard` element does not have to explicitly define `UiHeader`. It will be defined and processed inside of the rendering process (and only if `withHeader` is rendered).

### Limitations

#### Styling <!-- omit in toc -->

In the browser, which does not support Shadow DOM, ShadyCSS is used to create scoped CSS. This process requires moving out `<style>` element from the template and put it into the head of the document. It is done once and before expressions are calculated, so expressions inside style element are not processed correctly.

Expressions inside of the `<style>` element are only supported in native implementation of Shadow DOM. However, creating dynamic styles in the environment, which supports Shadow DOM can be inefficient (styles are not shared between elements instances).

##### Breaks template: (using ShadyCSS) <!-- omit in toc -->
```javascript
html`
  <style>
    div { color: ${user ? 'blue' : 'black'}; }
  </style>
  <div>Color text</div>
`;
```

##### Works fine: <!-- omit in toc -->
```javascript
html`
  <style>
    div { color: black; }
    div.user { color: blue; }
  </style>
  <div class="${{ user }}">Color text</div>
`
```

#### Table Family Elements <!-- omit in toc -->

`<table>`, `<tr>`, `<thead>`, `<tbody>`, `<tfoot>` and `<colgroup>` elements with expressions should not have additional text other than whitespace:

##### Breaks template: <!-- omit in toc -->
```javascript
html`<tr>${cellOne} ${cellTwo} some text</tr>`;
```

##### Works fine: <!-- omit in toc -->
  ```javascript
  html`<tr>${cellOne} ${cellTwo}</tr>`;
  ```

#### Template Element <!-- omit in toc -->

Expressions inside of the `<template>` element are not supported:

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

## ⚙️ Utils

#### `dispatch(host: Element, eventType: string, options)` <!-- omit in toc -->

* **arguments**:
  * `host` - element instance
  * `eventType` - type of the event to be dispatched
  * `options` - object following `dispatchEvent` DOM API specification
* **returns**:
  * `false` if event is cancelable and at least one of the event handlers which handled this event called `preventDefault()`, otherwise it returns `true`

`dispatch` is a helper function, which simplifies event dispatch on element instance. It creates `CustomEvent` with set `options` and dispatches it on given `host` element.

```javascript
import { html, dispatch } from 'hybrids';

function change(host) {
  host.value += 1;
  // Trigger not bubbling `change` custom event
  dispatch(host, 'change');
}

const MyElement = {
  value: 0,
  render: ({ value }) => html`
    <button onclick="${change}">You clicked me ${value} times!</button>
  `,
};
```

## 📃 License

`hybrids` is released under the [MIT License](LICENSE).

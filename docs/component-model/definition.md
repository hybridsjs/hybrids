# Component Definition

## Custom Elements

### Single Component

To define a web component use the `define` function:

```typescript
define(component: object & { tag: string }): component;
```

* **arguments**:
  * `component` - an object with a map of property descriptors and a tag name set in the `tag` property
* **returns**:
  * `component` - a passed argument to `define()` function

The `define` function returns the passed definition object, so the following file structure is recommended:

```javascript
import { define } from "hybrids";

export default define({
  tag: "my-element",
  ...
});
```

The above short syntax allows you to import the definition in another module, for example for unit testing or for reference.

### Multiple Components

For larger projects with multiple definitions of the UI or view components, you can use `define.from()` method, which targets application setup using a bundler, like [Vite](https://vitejs.dev/).

The method accepts an object map of component definitions with tag names as keys, plus optional settings. The key might contain a path to the file (slashes are replaced with dashes, the file extension is removed, and camelCase is converted to dash-case) or a target tag name. The `tag` key is dynamically injected (if not defined directly) into the component definition before it is passed to the `define` function.

As a result, with the `define.from()` method, modules with components can skip the `tag` property and should export the component definition instead of the result of the `define` function.

```typescript
define.from(components: object, options?: { prefix?: string; root?: string | string[]}): components;
```

* **arguments**:
  * `components` - an object map of components with tag names as keys (or paths to the files)
  * `options` - an optional object with settings
    * `prefix` - a prefix added to the tag names
    * `root` - a string or a list of strings, which are removed from the tag names
* **returns**:
  * `components` - a passed argument to `define.from()` function

The example below shows how to use the `define.from()` method with the [Vite](https://vitejs.dev/) bundler. The `define.from()` method is called in the `app.js` file, which is the entry point of the application. The rest of the component definitions don't have to use the `define` function directly, and can export the component definition without explicitly setting the `tag` property (it is dynamically generated from the file path).

**./components/HelloWorld.js**:

```javascript
import { html } from "hybrids";

export default {
  render: () => html`<div>Hello World!</div>`,
}
```

**./app.js**:

```javascript
import { define } from "hybrids";

define.from(
  import.meta.glob("./components/*.js", { eager: true, import: "default" }),
  { root: "components" }
);
```

### Constructor

If you need access to the custom element constructor, you can use the built-in method from the Custom Elements API:

```javascript
// defines a custom element with tag name included as a property
import component from "./my-element.js";

const MyElement = customElements.get(component.tag);
const el = new MyElement();
```

## External Usage

For producing the class without defining the custom element, use the `define.compile()` method with the component definition without the `tag` property. This mode can be helpful for creating a custom element for external usage without depending on a tag name, or if the components library is not used directly.

```typescript
define.compile(component: object): HTMLElement;
```

* **arguments**:
  * `component` - an object with a map of hybrid property descriptors without the `tag` property
* **returns**:
  * `HTMLElement` - a constructor for the custom element (not registered in the global custom elements registry)

**Package**:

```javascript
import { define } from "hybrids";

export default define.compile({
  name: "",
  render: ({ name }) => html`
    <div>Hello ${name}!</div>
  `,
});
```

**Customer**:

```javascript
import { MyElement } from "components-library";

// Register the custom element from the package 
customElements.define("my-super-element", MyElement);
```

```html
<my-super-element name="John"></my-super-element>
```

## Mounting

The definition as a map of hybrid properties is decoupled from the `HTMLElement` class constructor. It is possible to attach the component to an existing DOM element instead of defining new custom elements.

The feature is most helpful for a full-page app setup, where replacing `define()` with the `mount()` function does not require a root custom element, as you can attach the component definition directly to the `document.body` element.

```typescript
mount(target: HTMLElement, component: object): void;
```

* **arguments**:
  * `target` - a DOM element to attach the component definition to; usually it should be `document.body`
  * `component` - an object with a map of hybrid property descriptors without the `tag` property

The example below shows a simplified setup of an application with a router (you can use all of the framework's features, including the layout engine). The stack of the router will be rendered directly as children of the `document.body` element.

```javascript
import { mount, html, router } from "hybrids";

import Home from './views/home.js';

const App = {
  stack: router(Home),
  render: ({ stack }) => html`
    <template layout="column">
      ...
      ${stack}
    </template>
  `,
};

mount(document.body, App);
```

```html
<html>
  ...
  <body class="l-e0y8i-c">
    <my-app-home-view>...</my-app-home-view>
  </body>
</html>
```

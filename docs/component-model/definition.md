# Definition

To define a web component use the `define` function from the library:

```typescript
define(component: object & { tag: string }): component;
```

* **arguments**:
  * `component` - an object with map of property descriptors with a tag name set in the `tag` property
* **returns**:
  * `component` - a passed argument to `define()` function

The `tag` property only describes a custom element tag name, and it is not added to the constructor prototype. However, the `HTMLElement` prototype provides a `tagName` computed property, which returns an uppercase version of the tag name.

The `define` function returns the passed definition object, so the following slick structure of the file is possible:

```javascript
import { define } from "hybrids";

export default define({
  tag: "my-element",
  ...
});
```

The above structure allows short syntax, and still allows to import the definition in another module, for example for unit testing, or the reference.

## Constructor

If you need access to the custom element constructor, you can use the built-in method from the Custom Elements API:

```javascript
// defines a custom element with tag name included as a property
import "./my-element.js";

const MyElement = customElements.get("my-element");
const el = new MyElement();
```

## External Usage

The library supports defining a class constructor without the tag name, which can be used to create a custom element. Instead of using `define` function, use `define.compile()` method with the component definition without the `tag` property.

This mode might help create a custom element for external usage without depending on a tag name, and where the library is not used directly.

```typescript
define.compile(component: object): HTMLElement;
```

* **arguments**:
  * `component` - an object with map of hybrid property descriptors without `tag` property
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
import MyElement from "components-library";

// Register the custom element from the package 
customElements.define("my-super-element", MyElement);
```

```html
<my-super-element name="John"></my-super-element>
```

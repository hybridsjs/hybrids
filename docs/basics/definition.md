# Definition

```javascript
import { define } from "hybrids";
```

To define custom elements with hybrids, use custom `define()` function from the library.

## Tagged Definition

```typescript
define(descriptors: Object & { tag: string }): descriptors;
```

* **arguments**:
  * `descriptors` - a map of hybrid property descriptors with string `tag` property in pascal case or camel case
* **returns**:
  * `descriptors` - passed argument to `define()` function

The preferred way to structure and define web components with hybrids is to use a tagged definition and `define()` function within the same ES module.

> The `tag` property only describes a custom element tag name, and it is not added to the constructor prototype. However, the `HTMLElement` prototype provides `tagName` computed property, which returns a uppercase version of the tag name.

The function returns the passed definition object, so the following slick structure of the file can be used:

```javascript
import { define } from "hybrids";

// Define single element with tag name included as a property,
// returns the passed object
export default define({
  tag: "my-element",
  ...
});
```

The above structure allows very short syntax, and still ability to import the definition in another module, for example for unit testing. If you need access to the custom element constructor, you can use built-in method from the Custom Elements API:

```javascript
// defines a custom element with tag name included as a property
import "./my-element.js";

const MyElement = customElements.get("my-element");
const el = new MyElement();
```

### Multiple Tagged Definitions

```typescript
define(...descriptors: Object[]): typeof descriptors;
```

* **arguments**:
  * `descriptors` - a number of arguments of descriptors with string `tag` property in pascal case or camel case
* **returns**:
  * an array of `descriptors` objects

An another approach for structuring files is to create a single index file, import all of the required definitions, and use the `define()` function once with all of the components:

```javascript
import { define } from "hybrids";

import MyElement from "./my-element.js";
import MyOtherElement from "./my-other-element.js";

define(MyElement, MyOtherElement);
```

## Explicit Definition

```typescript
define(tagName: string | null, descriptors: Object): Wrapper
```

* **arguments**:
  * `tagName` - a custom element tag name or `null`,
  * `descriptors` - an object with a map of hybrid property descriptors
* **returns**:
  * `Wrapper` - custom element constructor (extends `HTMLElement`)

The library still supports `define()` function with explicit tag name, but it is not preferred way and should be avoided. (It is considered to be deprecated in the future versions of the library).

```javascript
import { define } from 'hybrids';

const MyElement = {
  ...
};

// Define single element with explicit tag name
define('my-element', MyElement);
```

### Class Constructor

If the `tagName` is set to `null`, the explicit call to `define` function only generates class constructor without registering it in the global custom elements registry. This mode might be helpful for creating a custom element for external usage without depending on tag name, and where the `hybrids` library is not used directly.

```javascript
// package
const MyElement = { ... };
export default define(null, MyElement);

// customer
import MyElement from "components-library";
customElements.define("my-super-element", MyElement);
```
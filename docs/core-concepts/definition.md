# Definition

To define custom element use `define` function. It takes a tag name and plain object with property descriptors, or an object with a map of definitions.

To simplify using external custom elements with those created by the library, you can pass `constructor` instead of a plain object. Then `define` works exactly the same as the `customElements.define()` method.

## Single Element

```javascript
import { define } from 'hybrids';

const MyElement = {
  ...
};

// Define one element with explicit tag name
define('my-element', MyElement);
```

```typescript
define(tagName: string | null, descriptorsOrConstructor: Object | Function): Wrapper
```

* **arguments**:
  * `tagName` - a custom element tag name or `null`,
  * `descriptorsOrConstructor` - an object with a map of hybrid property descriptors or a constructor
* **returns**:
  * `Wrapper` - custom element constructor (extends `HTMLElement`)

If the `tagName` is set to `null`, the `define` function only generates a class constructor without registering it in the global custom elements registry. This mode might be helpful for creating a custom element for external usage without dependency on tag name, and where the `hybrids` library is not used directly.

```javascript
// in the package
const MyElement = { ... };
export default define(null, MyElement);

// in the client
import { MyElement } from "components-library";
customElements.define("my-super-element", MyElement);
```

## Map of Elements

```javascript
import { define } from 'hybrids';
import { MyElement, OtherElement } from 'some-elements';

// Define one or more elements
define({ MyElement, OtherElement, ... });
```

```typescript
define({ tagName: descriptorsOrConstructor, ... }): { tagName: Wrapper, ... }
```

* **arguments**:
  * `tagName` - a custom element tag name in pascal case or camel case,
  * `descriptorsOrConstructor` - an object with a map of hybrid property descriptors or constructor
* **returns**: 
  * `{ tagName: Wrapper, ...}` - a map of custom element constructors (extends `HTMLElement`)
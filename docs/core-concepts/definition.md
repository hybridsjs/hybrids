# Definition

To define custom element use `define` function. It takes a tag name and plain object with property descriptors, or an object with a map of definitions.

To simplify using external custom elements with those created by the library, you can pass `constructor` instead of a plain object. Then `define` works exactly the same as the `customElements.define()` method.

### Single Element

```javascript
import { define } from 'hybrids';

const MyElement = {
  ...
};

// Define one element with explicit tag name
define('my-element', MyElement);
```

```typescript
define(tagName: string, descriptorsOrConstructor: Object | Function): Wrapper
```

* **arguments**:
  * `tagName` - a custom element tag name,
  * `descriptorsOrConstructor` - an object with a map of hybrid property descriptors or constructor
* **returns**: 
  * `Wrapper` - custom element constructor (extends `HTMLElement`)

### Map of Elements

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

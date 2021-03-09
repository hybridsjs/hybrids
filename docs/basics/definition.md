# Definition

```javascript
import { define } from 'hybrids';
```

To define web components from a map of descriptors use custom `define()` function.

## Single Element

```javascript
import { define } from 'hybrids';

const MyElement = {
  ...
};

// Define single element with explicit tag name
define('my-element', MyElement);
```

```typescript
define(tagName: string | null, descriptors: Object): Wrapper
```

* **arguments**:
  * `tagName` - a custom element tag name or `null`,
  * `descriptors` - an object with a map of hybrid property descriptors
* **returns**:
  * `Wrapper` - custom element constructor (extends `HTMLElement`)

### Class Constructor

If the `tagName` is set to `null`, the `define` function only generates class constructor without registering it in the global custom elements registry. This mode might be helpful for creating a custom element for external usage without depending on tag name, and where the `hybrids` library is not used directly.

```javascript
// package
const MyElement = { ... };
export default define(null, MyElement);

// customer
import { MyElement } from "components-library";
customElements.define("my-super-element", MyElement);
```

## Multiple Elements

```javascript
import { define } from 'hybrids';
import { MyElement, OtherElement } from 'some-elements';

// Define one or more elements
define({ MyElement, OtherElement, ... });
```

```typescript
define({ tagName: descriptors, ... }): { tagName: Wrapper, ... }
```

* **arguments**:
  * `tagName` - a custom element tag name in pascal case or camel case,
  * `descriptors` - an object with a map of hybrid property descriptors
* **returns**:
  * `{ tagName: Wrapper, ...}` - a map of custom element constructors (extends `HTMLElement`)
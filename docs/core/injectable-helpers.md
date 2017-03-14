# Injectable Helpers

Hybrid component has no direct access to Web APIs. To connect DOM API to the hybrid component use **injectable helpers**. These functions receive DOM element instance as an argument, depending on the invoking context. This feature allows to use them as a pure function inside of component class definition without passing context every time.

Core package provides number of injectable helpers:

* [`host`](/core/host-element.md)
* [`listenTo`, `dispatchEvent`](/core/listen-and-dispatch-events.md)
* [`parent`, `children`](/core/tree-traversing.md)

## Resolving Context

The library resolves correct context for `constructor()` and methods defined on component prototype. For anonymous callback functions you have to wrap them with `resolve()`:

### `resolve(callback): function`

* `callback` is a function, which you want to pass as a async callback
* Returns `function`, which will have always proper context

If injectable helper is called in incorrect context, it throws `Illegal invocation`. It usually means that you didn't wrap your callback function properly.

```javascript
import { resolve, dispatchEvent } from '@hybrids/core';

class MyElement {
  constructor() {
    setTimeout(
      // Wrap your callback with resolve(fn)
      resolve( () => dispatchEvent('some-change') ),
    , 1000);
  }
}
```

## Custom Helpers

It is easy to create your own injectable helper. To do that wrap you helper using `injectable()`:

### `injectable(helper): function`

* `helper` is a function, which gets first argument as an element host
* Returns `function`, which called in proper context passes host element to `helper`

```javascript
// add-class.js
import { injectable } from '@hybrids/core';

function addClass(el, className) {
  el.classList.add(className);
}

export default injectable(addClass);

// my-element.js
```javascript
import addClass from './add-class';

export class MyElement {
  constructor() {
    addClass('my-super-element');
  }
}
```

In this example, `addClass()` method takes class name and adds it to the element instance connected with hybrid component.


# Listen and Dispatch Events

### `listenTo(eventType, callback, options): fn`

Adds event listener callback to host element.

* Arguments follow [`addEventListener(...)`](https://developer.mozilla.org/docs/Web/API/Element/addEventListener)
* execution context of the `callback` is automatically bind to hybrid component instance
* Returned `fn` calls `removeEventListener()` for bind `callback`

```javascript
import { listenTo, dispatchEvent } from '@hybrids/core';

class MyElement {
  constructor() {
    this.stop = listenTo('click', this.myAction);
  }
  
  myAction() {
    ...
    // When you want to cancel listening call returned function
    this.stop();
  }
}
```

### `dispatchEvent(eventType, options)`

Dispatches `CustomEvent` on host element.

* `options` follows [`CustomEvent`](https://developer.mozilla.org/docs/Web/API/CustomEvent/CustomEvent) constructor, defaults to: 
  ```javascript
  { bubbles: true, cancelable: false, detail: null }
  ```
* `detail` property can be used to pass custom data

```javascript
import { dispatchEvent } from '@hybrids/core';

class MyElement {
  doSomething() {
    dispatchEvent('my-custom-event', { detail: 'some info' });
  }
}
```
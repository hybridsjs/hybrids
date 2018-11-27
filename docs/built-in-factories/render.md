# Render

```typescript
render(fn: Function, options: Object = { shadowRoot: true }): Object
```

* **arguments**:
  * `fn(host: Element): Function` - callback function with `host` argument; returned function has `host` and `target` arguments
  * `options: Object` - an object, which has a following structure:
    * `{ shadowRoot: true }` (default value) - initializes Shadow DOM and set `target` as `shadowRoot`
    * `{ shadowRoot: false }` - sets `target` argument as `host`,
    * `{ shadowRoot: { extraOption: true, ... } }` - initializes Shadow DOM with passed options for `attachShadow()` method
* **returns**:
  * hybrid property descriptor, which resolves to a function

```javascript
import { render } from 'hybrids';

export const MyElement = {
  someProp: render((host) => {
    return (host, target) => {
      // update DOM here
    }
  }, { shadowRoot: ... })
};
```
👆 [Click and play with `render` factory using  `React` library on ⚡StackBlitz](https://stackblitz.com/edit/hybrids-react-counter?file=react-counter.js)

Render factory creates and updates the DOM structure of your custom element. It works out of the box with built-in [template engine](../template-engine/introduction.md), but the passed `fn` function may use any external UI library, that renders DOM.

The `render` key of the property is not mandatory. However, the first rule of the [translation](../core-concepts/translation.md) makes possible to pass `fn` function as a `render` property value to use render factory:

```javascript
import { html } from 'hybrids';

const MyElement = {
  value: 1,
  render: ({ value }) => html`
    <div>${value}</div>
  `,
};
```

The factory uses Shadow DOM, which is created synchronously in `connect` callback. It can be disabled in the `options` object. Then, `target` argument of update function is a `host`. However, `options` object can be passed only with explicit definition using `render` factory function.

## Update Mechanism

Render factory updates an element using global render scheduler. It listens to `@invalidate` event trigger by the change detection. It schedules update with `requestAnimationFrame()` API and adds an element to the queue. The DOM is updated when one of the properties used in `fn` changes.

However, if execution of the update passes ~16ms threshold (it counts from the beginning of the schedule), the following elements in the queue are updated with next `requestAnimationFrame()`.

### Manual Update

It is possible to trigger an update by calling property manually on the element instance:

```javascript
const myElement = document.getElementsByTagName('my-element')[0];
myElement.render();
```

Property defined with `render` factory uses the same cache mechanism like other properties. The update process calls `fn` only if related properties have changed.
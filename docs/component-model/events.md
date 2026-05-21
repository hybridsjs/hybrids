# Component Events

The `dispatch` function simplifies event generation on element instances. It creates a `CustomEvent` with the selected `options` and dispatches it on the given `host` element. (As custom events are part of the HTML standard, you can generate them manually without using `dispatch` from the library.)

```typescript
dispatch(host: Element, eventType: string, [options]): boolean
```

* **arguments**:
  * `host` - element instance
  * `eventType` - a type of the event to be dispatched
  * `options` - a dictionary, having the following optional fields:
    * `bubbles: false` - a boolean indicating whether the event bubbles
    * `cancelable: false` - a boolean indicating whether the event can be canceled
    * `composed: false` - a boolean indicating whether the event will trigger listeners outside of a shadow root
    * `detail: undefined` - custom data, which will be passed to the event listener
* **returns**:
  * If the event is cancelable and at least one of the event handlers that handled this event called `preventDefault()`, it returns `false`; otherwise it returns `true`

For example, it can be used to dispatch a `custom-change` event and notify a user of the custom element that the value has changed:

```javascript
import { html, dispatch } from 'hybrids';

function increaseCount(host) {
  host.value += 1;
  // Trigger not bubbling `custom-change` custom event
  dispatch(host, 'custom-change', { detail: host.value });
}

define({
  tag: "my-element",
  value: 0,
  render: ({ value }) => html`
    <button onclick="${increaseCount}">You clicked me ${value} times!</button>
  `,
});
```

When using `<my-element>` elsewhere, you can listen to the `custom-change` event:

```javascript
function notify(host, event) {
  // logs current `value` of the element
  console.log(event.detail);
}

define({
  tag: "other-element",
  render: () => html`
    <my-element oncustom-change="${notify}"></my-element>
  `,
});
```

Also, you can use the `addEventListener` API:

```javascript
const myEl = document.getElementsByTagName('my-element')[0];

myEl.addEventListener("custom-change", ({ detail }) => {
  console.log(detail);
});
```

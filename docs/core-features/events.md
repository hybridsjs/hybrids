# Events

```javascript
import { dispatch } from "hybrids";
```

The standard communication layer for HTML elements is provided by DOM events, like `click` or `submit`. Instead of creating properties with callbacks, dispatch custom event, which can be listen just like other standard events.

`dispatch` function from the library is a helper, which simplifies event generation on element instance. It creates a `CustomEvent` with selected `options` and dispatches it on given `host` element. Still, as the custom events are part of the HTML standard, you can generate them manually without using `dispatch` from the library.

## Usage

```typescript
dispatch(host: Element, eventType: string, [options]): Boolean
```

* **arguments**:
  * `host` - element instance
  * `eventType` - type of the event to be dispatched
  * `options` - a dictionary, having the following optional fields:
    * `bubbles: false` - a boolean indicating whether the event bubbles
    * `cancelable: false` - a boolean indicating whether the event can be cancelled
    * `composed: false` - a boolean indicating whether the event will trigger listeners outside of a shadow root
    * `detail: undefined` - a custom data, which will be passed to an event listener
* **returns**:
  * if event is cancelable and at least one of the event handlers which handled this event called `preventDefault()`, it returns `false`, otherwise it returns `true`

For example, it can be used to dispatch `custom-change` event and notify a user of the custom element, that value has changed:

```javascript
import { html, dispatch } from 'hybrids';

function increaseCount(host) {
  host.value += 1;
  // Trigger not bubbling `custom-change` custom event
  dispatch(host, 'custom-change', { detail: host.value });
}

const MyElement = {
  value: 0,
  render: ({ value }) => html`
    <button onclick="${increaseCount}">You clicked me ${value} times!</button>
  `,
};
```

When using `<my-element>` elsewhere you can listen to `custom-change` event:

```javascript
function notify(host, event) {
  // logs current `value` of the element
  console.log(event.detail);
}

const OtherElement = {
  render: () =>  html`
    <my-element oncustom-change="${notify}"></my-element>
  `,
};
```

Also, you can use `addEventListener` API just like for built-in elements:

```javascript
const myEl = document.getElementsByTagName('my-element')[0];

myEl.addEventListener("custom-change", ({ detail }) => {
  console.log(detail);
});
```

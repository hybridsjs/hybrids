# Utils

## Event Dispatcher

```typescript
dispatch(host: Element, eventType: string, [options]): Boolean
```

* **arguments**:
  * `host` - element instance
  * `eventType` - type of the event to be dispatched
  * `options` - a dictionary, having the following optional fields:
    * `bubbles` - a boolean indicating whether the event bubbles. The default is false
    * `cancelable` - a boolean indicating whether the event can be cancelled. The default is false
    * `composed` - a boolean indicating whether the event will trigger listeners outside of a shadow root The default is false
    * `detail` - a custom data, which will be passed to an event listener
* **returns**:
  * `false` if event is cancelable and at least one of the event handlers which handled this event called `preventDefault()`, otherwise it returns `true`


`dispatch` is a helper function, which simplifies event dispatch on element instance. It creates `CustomEvent` with set `options` and dispatches it on given `host` element.

For example, it can be used to dispatch `change` event and notify a user of the custom element, that value has changed:

```javascript
import { html, dispatch } from 'hybrids';

function change(host) {
  host.value += 1;
  // Trigger not bubbling `change` custom event
  dispatch(host, 'change', { detail: host.value });
}

const MyElement = {
  value: 0,
  render: ({ value }) => html`
    <button onclick="${change}">You clicked me ${value} times!</button>
  `,
};
```



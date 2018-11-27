# Utils

## Dispatching Events

```typescript
dispatch(host: Element, eventType: string, options): Boolean
```

* **arguments**:
  * `host` - element instance
  * `eventType` - type of the event to be dispatched
  * `options` - object following `dispatchEvent` DOM API specification
* **returns**:
  * `false` if event is cancelable and at least one of the event handlers which handled this event called `preventDefault()`, otherwise it returns `true`


`dispatch` is a helper function, which simplifies event dispatch on element instance. It creates `CustomEvent` with set `options` and dispatches it on given `host` element.

For example, it can be used to dispatch `change` event and notify a user of the custom element, that value has changed:

```javascript
import { html, dispatch } from 'hybrids';

function change(host) {
  host.value += 1;
  // Trigger not bubbling `change` custom event
  dispatch(host, 'change');
}

const MyElement = {
  value: 0,
  render: ({ value }) => html`
    <button onclick="${change}">You clicked me ${value} times!</button>
  `,
};
```



# Event Listeners

`on*` attribute expression resolves to event listener set by the `addEventListener` API. The part of the attribute after `on` prefix is used as an event type. The function returned by the expression is called in an event listener callback.

```javascript
function send(host, event) {
  event.preventDefault();

  // do something with value property
  sendData('api.com/create', { value: host.value });
}

const MyElement = {
  value: 42,
  render: () => html`
    <form onsubmit="${send}">
      ...
    </form>
  `,
};
```

The first argument of the callback function is the custom element instance (event target element is available at `event.target`). In the result, access to the element in the render function is not required and callback can be defined as a pure function.
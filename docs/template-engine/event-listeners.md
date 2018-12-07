# Event Listeners

An expression in the `on*` attribute resolves to event listener set by the `host.addEventListener(eventType, callback, options)` with the part of the attribute after `on` prefix as an event type (exact characters) and `options` set to `false`. A function returned by the expression is called in an event listener `callback`.

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

The first argument of the callback function is the custom element instance (event target element is available at `event.target`). Access to the element in the render function is not required, so callback can be defined as a pure function.

## Options

You can pass custom `options` to `addEventListener()` function by defining `options` property of the function.

It can be boolean value (it defaults to `false`):

```javascript
function onClick(host) {
  // do something
}
onClick.options = true; // capture mode

html`
  <div onclick="${onClick}">
    <button>...</button>
  </div>
`;
```

it can be an object:

```javascript
function onScroll(host) {
  // do something
}
onScroll.options = { passive: true }; // an object with characteristics

html`
  <div class="container" onscroll="${onScroll}">
    ...
  </div>
`;
```

Read [MDN documentation](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener) for all available values of the `options` argument.
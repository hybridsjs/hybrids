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

You can pass custom `options` to `addEventListener` API by defining `options` property of the function.

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

## Form Elements

Your template may contain built-in form elements or custom elements with value, which should be bound to one of the properties of the host. You can create callback manually for each case like this:

```javascript
function updateName(host, event) {
  host.name = event.target.value;
}

const MyElement = {
  name: '',
  render: ({ name }) => html`
    <input type="text" defaultValue="${name}" oninput="${updateName}" />
    ...
  `,
};
```

Using the above pattern may become verbose quickly if your template contains many values to bind. Because it is a common task, the template engine provides `html.set` method, which generates callback function for updating host property with `event.target.value` or a custom value.

```typescript
html.set(propertyName: string, [value: any]): Function
```

* **arguments**:
  * `propertyName` - a target host property name
  * `value` - a custom value, which will be set instead of `event.target.value` (default behavior)
* **returns**:
  * callback function compatible with template engine event listener feature

```javascript
const MyElement = {
  name: '',
  date: null,
  render: ({ name, date }) => html`
    <input type="text" defaultValue="${name}" oninput="${html.set('name')}" />
    <my-date-picker value="${date}" onchange="${html.set('date')}"></my-date-picker>
  `,
};
```

In the above example, you can notice, that `html.set` also works with any custom element, that provides `value` property.

### Custom Value

You can overwrite the default behavior and pass a custom value to the second parameter of the `html.set` method. It is useful for callbacks inside of the [iteration](./iteration.md):

```javascript
const MyElement = {
  items: [{ value: 1 }, { value: 2}],
  selected: null,
  render: ({ items }) => html`
    <ul>
      ${items.map(item => html`
        <li>
          <span>value: ${item.value}</span>
          <button onclick="${html.set('selected', item)}">select item!</button>
        </li>
      `)}
    </ul>
  `,
}
```

In the above example, when a user clicks on the item button, `selected` property is set to the current item.
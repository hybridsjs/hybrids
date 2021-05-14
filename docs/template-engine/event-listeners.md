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

The template may contain built-in form elements or custom elements with a value, which should be bound to one of the properties of the host.

You can create callback manually for updating the host property value:

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

Using the above pattern may become verbose if your template contains many values to bind. The engine provides `html.set()` helper method, which generates callback function for setting host property from value of the element, or set store model property value.

### Property Name

```typescript
html.set(propertyName: string, value?: any): Function
```

* **arguments**:
  * `propertyName` - a target host property name
  * `value` - a custom value, which will be set instead of `event.target.value`
* **returns**:
  * a callback function compatible with template engine event listener

The `html.set()` supports generic elements and unique behavior of the form elements:

* for `<input type="radio">` and `<input type="checkbox">` the value is related to its `checked` value
* For `<input type="file">`  the `event.target.files` is used instead of the `event.target.value`
* For the rest elements, it uses `event.detail.value` if defined, or eventually `target.value` as default

```javascript
const MyElement = {
  option: false,
  date: null,
  render: ({ option, date }) => html`
    <input type="checkbox" checked="${option}" onchange="${html.set("option")}" />

    <!-- updates "host.date" with "value" property from the element -->
    <my-date-picker value="${date}" onchange="${html.set("date")}"></my-date-picker>

    <!-- updates "host.option" with "event.detail.value" from the element -->
    <paper-toggle-button onchecked-changed="${html.set("option")}"></paper-toggle-button>
  `,
};
```

#### Custom Value

You can overwrite the default behavior and pass a custom value as a second parameter (`event.target.value` is not used):

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

In the above example, when a user clicks on the item button, the `selected` property is set to `item` from the loop.

### Store Model

```typescript
html.set(model: object, propertyPath: string | null): Function
```

* **arguments**:
  * `model` - a [store](../store/introduction.md) model instance
  * `propertyPath`
    * a `string` path to the property of the model, usually a single name, like `"firstName"`; for nested property use dot notation, for example `"address.street"`
    * `use null` for model deletion, like `html.set(user, null)`
* **returns**:
  * a callback function compatible with template engine event listener

```javascript
import { store } from "hybrids";
import User from "./models.js";

const MyElement = {
  user: store(User, { id: "userId", draft: true }),
  render: ({ user }) => html`
    <input
      value="${user.firstName}"
      oninput="${html.set(user, "firstName")}"
    />
    <input
      value="${user.address.street}"
      oninput="${html.set(user, "address.street")}"
    />

    ...

    <button onclick="${html.set(user, null)}">Delete user</button>
  `,
};
```

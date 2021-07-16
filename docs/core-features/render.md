# Render

```javascript
import { render } from "hybrids";
```

Render factory creates and updates the DOM internal structure of the web components. It works out of the box with built-in [template engine](../template-engine/introduction.md), but it can be used with any UI library that renders DOM.

## Usage

```typescript
render(fn: Function, options: Object = { shadowRoot: true }): Object
```

* **arguments**:
  * `fn(host: Element): (host, target) => {}` - a callback function with `host` argument, which returns a function with `host` and `target` arguments
  * `options: Object` - an object, which has a following structure:
    * `{ shadowRoot: true }` (default) - initializes Shadow DOM and set `target` as `shadowRoot`
    * `{ shadowRoot: false }` - sets `target` argument as `host`,
    * `{ shadowRoot: { extraOption: true, ... } }` - initializes Shadow DOM with passed options for `attachShadow()` method
* **returns**:
  * hybrid property descriptor, which resolves to a function (when called manually, it returns `target`)

```javascript
import { render } from 'hybrids';

define({
  tag: "my-element",
  someProp: render((host) => {
    return (host, target) => {
      // update DOM here
    }
  }, { shadowRoot: ... })
});
```

> Click and play with render factory example using [React](http://reactjs.org/) library:
>
> [![Edit <react-counter> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/react-counter-web-component-built-with-hybrids-library-u0g8k?file=/src/ReactCounter.jsx)

Render factory triggers update of the DOM in `observe` method of the descriptor. It means that an update is scheduled with internal queue and it is executed within next animation frame. The `observe` method ensures that passed `fn` is called when element connects for the first time and when related properties change.

If you use render factory for wrapping other UI library, remember to access required properties from the `host` synchronously in the body of `fn` function, not in the returned update function Only then the cache can save dependencies for the update. Otherwise, your function might be called only once.

> Click and play with render factory using [lit-html](https://lit-html.polymer-project.org/) library:
>
> [![Edit <lit-counter> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/lit-counter-web-component-built-with-hybrids-library-qoqb5?file=/src/LitCounter.js)

### Shadow DOM

The factory by default uses [Shadow DOM](https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM) as a `target`, which is initialized when the component is rendered for the first time. Although, If your element does not require [style encapsulation](https://developers.google.com/web/fundamentals/web-components/shadowdom#styling) and [children distribution](https://developers.google.com/web/fundamentals/web-components/shadowdom#composition_slot) (`<slot>` element can be used only inside of the `shadowRoot`) you can disable Shadow DOM in the `options` object. Then, `target` argument of the update function becomes a `host`.

```javascript
import { html, render } from 'hybrids';

define({
  tag: "my-element",
  value: 1,
  render: render(
    ({ value }) => html`<div>${value}</div>`,
    { shadowRoot: false },
  ),
});
```

### Translation

You can omit explicit usage of the render factory by two of the [translation](../getting-started/concepts.md#translation) rules:

1. The `render` property definition is a function, the render factory renders into the Shadow DOM

    ```javascript
    import { html } from 'hybrids';

    define({
      tag: "my-element",
      value: 1,
      // Equals to render: render(({ value }) => html...
      render: ({ value }) => html`<div>${value}</div>`,
    });
    ```

2. If the `content` property definition is a function, the render factory renders to the host element content

    ```javascript
    import { html } from 'hybrids';

    define({
      tag: "my-element",
      value: 1,
      // Equals to content: render(({ value }) => ..., { shadowRoot: false }),
      content: ({ value }) => html`<div>${value}</div>`,
    });
    ```

### Multiple Usage

The render factory can be used multiple times on the same host element. This feature can be useful for building web components with hidden layout structure and data content in the light DOM. The two translation rules makes it super simple:

```javascript
import { store } from "hybrids";

const Data = {
  value: "My data",
};

define({
  tag: "my-element",
  data: store(Data),
  title: "",
  render: ({ title }) => html`
    <h1>${title}</h1>
    <div><slot></slot></div>
  `,
  content: ({ data }) => html`
    ${store.ready(data) && html`<p>${data.value}</p>`}
  `,
});
```

In the result, in the Light DOM instance of the above element will look like this:

```html
<my-element>
 <p>My data</p>
</my-element>
```

Notice that the `<p>` element will be putted inside of the `<div>` element of the host `shadowRoot`.

If the layout structure repeats often, you define it outside of the component definition, as a factory resolving to the value accepted by the `render` property:

```javascript
import columnLayout from "./factories/layout.js";

define({
  tag: "my-element",
  data: store(Data),
  render: layout("column"),
  content: ({ data }) => ...,
});
```

### Manual Update

You can trigger an update process by calling property manually from the element instance:

```javascript
const myElement = document.getElementsByTagName('my-element')[0];
const target = myElement.render();

// returns `host.shadowRoot` or `host` element
console.log(target);
```

> The `render` factory uses the same cache mechanism like other properties. The update process calls `fn` only if related properties have changed. However, calling `myElement.render()` manually always invokes the result of the `fn()`, so it always triggers update process.

## Reference Internals

If your element should expose internal parts of the content as a public API, you can use `render` property to define an internal DOM element from the rendered content as another property. Using `render` in the getter of the defined property ensures that render process is called and it adds it to the dependencies of the property. The result of the call gives us a `target` element, so you don't have to relay on the render configuration (it might be the `shadowRoot` as well as the `host` element - but both has `querySelector` API):

```javascript
define({
  tag: "my-canvas-element",
  canvas: ({ render }) => {
    const target = render();
    return target.querySelector('canvas');
  },
  width: '100%',
  height: '100%',
  render: ({ width, height }) => html`
    <style>
      :host { ... }
    </style>
    <canvas style="${{ width, height }}"></canvas>
  `,
});
```

The `canvas` property from the above example will always reference the proper element from the shadowRoot. Even though the render process is asynchronous, if the user gets `canvas` before the first scheduled render, it will return the element interface because of calling `render()` manually. Moreover, the cache mechanism ensures that the `canvas` property result is cached. It is recalculated only when dependencies of the render property change. This allows creating dynamic selectors, which returns different results depends on the render dependencies.

If you need more references to internal elements, you can create simple factory and use it multiple times:

```javascript
function ref(query) {
  return ({ render }) => {
    if (typeof render === 'function') {
      const target = render();
      return target.querySelector(query);
    }

    return null;
  };
}

define({
  tag: "my-element",
  canvas: ref('canvas'),
  wrapper: ref('div#wrapper'),
  render: ({ ... }) => html`
    <canvas></canvas>
    <div id="wrapper">
      ...
    </div>
  `,
});
```

## Unit Testing

Because of the asynchronous nature of the update process, it might be tricky to test if the custom element instance renders correctly. However, you can create your unit tests based on the definition itself.

The render key is usually a function, which returns the update function. It can be called synchronously with mocked host and arbitrary target element (for example `<div>` element):

```javascript
import { html } from 'hybrids';

const MyElement = define({
  tag: "my-element",
  value: 1,
  render: ({ value }) => html`
    <div>${value}</div>
  `,
});

it('should render value "1"', () => {
  const div = document.createElement('div');
  const host = { value: 1 };

  // "render" key is a function
  const update = MyElement.render(host);

  // Updates target element
  update(host, div);

  // Check results synchronously
  expect(div.children[0].textContent).toBe('1');
});
```

If you use `render` factory explicitly, your template definition can be defined outside of the factory call:

```javascript
import { html, render } from 'hybrids';

// Take out template definition
const renderTemplate = ({ value }) => html`<div>${value}</div>`;

const MyElement = define({
  tag: "my-element",
  value: 1,
  render: render(renderTemplate, { shadowRoot: false }),
});

it('should render value "1"', () => {
  const div = document.createElement('div');
  const host = { value: 1 };

  const update = renderTemplate(host);

  // Updates target element
  update(host, div);

  // Check results synchronously
  expect(div.children[0].textContent).toBe('1');
});
```

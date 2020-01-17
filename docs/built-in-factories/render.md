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
  * hybrid property descriptor, which resolves to a function (when called manually, it returns `target`)

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

Render factory creates and updates the DOM structure of your custom element. It works out of the box with built-in [template engine](../template-engine/introduction.md), but the passed `fn` function may use any external UI library that renders DOM.

👆 [Click and play with `render` factory using  `React` library on ⚡StackBlitz](https://stackblitz.com/edit/hybrids-react-counter?file=react-counter.js)

Render factory trigger the update of the DOM by the `observe` method of the descriptor. It means that an update is scheduled with the internal queue and executed in the next animation frame. The passed `fn` is always called for the first time and when related properties change.

If you use render factory for wrapping other UI libraries, remember to access required properties from the `host` synchronously in the body of `fn` function (only then cache mechanism can save dependencies for the update). Otherwise, your function might be called only once.

👆 [Click and play with `render` factory using  `lit-html` library on ⚡StackBlitz](https://stackblitz.com/edit/hybrids-lit-html-counter?file=lit-counter.js)

## Translation

The `render` key of the property is not mandatory. However, the first rule of the [translation](../core-concepts/translation.md) makes possible to set `fn` function as a `render` property to use the render factory implicitly:

```javascript
import { html } from 'hybrids';

const MyElement = {
  value: 1,
  render: ({ value }) => html`<div>${value}</div>`, // It equals `render: render(({ value }) => ...)`
};
```

## Shadow DOM

The factory by default uses [Shadow DOM](https://developer.mozilla.org/docs/Web/Web_Components/Using_shadow_DOM) as a `target`, which is created synchronously in `connect` callback. It is expected behavior, so usually you can omit `options` object and use [translation](../core-concepts/translation.md) rule for the render factory.

Although, If your element does not require [style encapsulation](https://developers.google.com/web/fundamentals/web-components/shadowdom#styling) and [children distribution](https://developers.google.com/web/fundamentals/web-components/shadowdom#composition_slot) (`<slot>` element can be used only inside of the `shadowRoot`) you can disable Shadow DOM in the `options` object. Then, `target` argument of the update function becomes a `host`. As a result, your template will replace children's content of the custom element (in Light DOM).

Keep in mind that the `options` can be passed only with `render(fn, options)` factory function called explicitly:

```javascript
import { html, render } from 'hybrids';

const MyElement = {
  value: 1,
  render: render(
    ({ value }) => html`<div>${value}</div>`,
    { shadowRoot: false },
  ),
};
```

## Manual Update

It is possible to trigger an update by calling property manually on the element instance:

```javascript
const myElement = document.getElementsByTagName('my-element')[0];
const target = myElement.render();

console.log(target); // returns `host.shadowRoot` or `host` element according to the `shadowRoot` option
```

Property defined with `render` factory uses the same cache mechanism like other properties. The update process calls `fn` only if related properties have changed. However, calling `myElement.render()` always invoke the result of the `fn()` (the update function).

## Reference Internals

If your element should expose internal parts of the content as a public API, you can use `render()` to set custom property as an internal DOM element from the rendered content. Using `render` in the getter of the defined property ensures that render process is called and it adds it to the dependencies of the property. The result of the call gives us a `target` element, so you don't have to relay on the render configuration (it might be the `shadowRoot` as well as the `host` element - but both has `querySelector` API):

```javascript
const MyCanvasElement = {
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
}
```

The `canvas` property from the above example will always reference the proper element from the shadowRoot. Even though the render process is asynchronous, if the user gets `canvas` before the first scheduled render, it will return the element interface because of calling `render()` manually. Moreover, the cache mechanism ensures that the `canvas` property result is cached. It is recalculated only when dependencies of the render property change. This allows creating dynamic selectors, which returns different results depends on the render dependencies.

If you have more references to internal elements, you can create simple factory and use it multiple times:

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

const MyElement = {
  canvas: ref('canvas'),
  wrapper: ref('div#wrapper'),
  render: ({ ... }) => html`
    <canvas></canvas>
    <div id="wrapper">
      ...
    </div>
  `,
}
```

## Unit Testing

Because of the asynchronous update mechanism, it might be tricky to test if the custom element instance renders correctly. However, you can create your unit tests based on the definition itself.

The render key is usually a function, which returns the update function. It can be called synchronously with mocked host and arbitrary target element (for example `<div>` element):

```javascript
import { html } from 'hybrids';

const MyElement = {
  value: 1,
  render: ({ value }) => html`
    <div>${value}</div>
  `,
};

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

const MyElement = {
  value: 1,
  render: render(renderTemplate, { shadowRoot: false }),
};

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

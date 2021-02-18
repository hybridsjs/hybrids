# Concepts

The hybrids introduces a unique way for creating web components. Its name is taken from the idea of a mix of functional and object-oriented architecture.

Let's look again at the example from the home page of the documentation:

```javascript
import { html, define } from 'hybrids';

function increaseCount(host) {
  host.count += 1;
}

const SimpleCounter = {
  count: 0,
  render: ({ count }) => html`
    <button onclick="${increaseCount}">
      Count: ${count}
    </button>
  `,
};

define('simple-counter', SimpleCounter);
```

> Click and play with `<simple-counter>` example:
>
> [![Edit <simple-counter> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/simple-counter-web-component-built-with-hybrids-library-co2ow?file=/src/SimpleCounter.js)

Even though the above code might look straightforward, there are three unique concepts, that made it possible. The structure of the component is based on property descriptors, factories, and built-in translation. On another hand, the heart of the update process is based on complex cache mechanism and change detection attached to every property.

## Descriptors

The only way to create a custom element is to use a class, which extends `HTMLElement` and then define it with Custom Elements API:

```javascript
class MyElement extends HTMLElement {
  ...
}

customElements.define('my-element', MyElement);
```

However, the class syntax is only a sugar on top of the constructors and prototypes. Because of that, it is possible to switch from class syntax to plain object with map of properties applied to the prototype of the custom element constructor.

```javascript
const MyElement = {
  property: {
    get: ..., set: ..., connect: ..., observe: ...,
  },
  ...
};
```

Built-in cache with change detection mechanism avoid stateful and procedural code in global methods. Each property is independent, so it has own two lifecycle methods. You can setup required features of the property using `connect` method, and call side effects in `observe` method when value of the property changes.

> Read full explanation of the concept in [Descriptor](../basics/descriptor.md) section.

## Factories

The factory is a function, which produces property descriptor. It hides implementation details and minimizes redundant code. In most cases, descriptors are similar and have limited differences, so they can be parameterized by the function arguments. Also, the factory function can use local scope for setting variables required for the feature.

The following example shows how easy is to setup reusable connection to external library, like [`redux`](https://redux.js.org) by creating a factory:

```javascript
function connect(store, mapState) {
  const get = mapState
    ? () => mapState(store.getState())
    : () => store.getState();

  return {
    get,
    connect: (host, key, invalidate) => {
      return store.subscribe(() => {
        if (host[key] !== get()) invalidate();
      });
    },
  };
}
```

```javascript
// Each instance is connected to `state.count` value
const MyCountElement = {
  count: connect(myReduxStore, (state) => state.count),
  render: ({ count }) => html`...`,
};

// Each instance is connected to `state.other` value
const MyOtherStateElement = {
  other: connect(myReduxStore, (state) => state.other),
  render: ({ other }) => html`...`,
}
```

> Click and play with [redux](redux.js.org) library integration example:
>
> [![Edit <redux-counter> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/redux-counter-web-component-built-with-hybrids-library-jrqzp?file=/src/ReduxCounter.js)

The library core features are based on factories. You can find more information about them in the following sections:

* [`property()`](../core-features/property.md) factory for setting inputs with fallback to the attributes
* [`render()`](../core-features/render.md) factory for creating DOM structure of the element
* [`parent()` and `children()`](../core-features/parent-children.md) factories for referencing other elements in the DOM

> Factories are the best way to extend library functionality

## Translation

The translation feature uses set of rules for property definitions, which does not match descriptor structure. For example, you can omit explicit usage of the `property()` or `render()` factory. Otherwise, they should be used almost in every definition.

Instead of explicit usage of the `property` and `render` factories like this:

```javascript
import { property, render, html } from 'hybrids';

export const MyElement = {
  count: property(0),
  render: render(({ count }) => html`
    <button>${count}</button>
  `),
}
```

You can write component definition using translation rules:

```javascript
import { html } from 'hybrids';

export const MyElement = {
  count: 0,
  render: ({ count }) => html`
    <button>${count}</button>
  `,
}
```

The process is done in the following order:

1. **`render` key descriptor with value as a function** translates to [`render`](../core-features/render.md) factory:

    ```javascript
    import { render } from 'hybrids';

    { render: () => { ... } }
    // Translates to:
    { render: render(() => {...}) }
    ```

1. **`content` key descriptor with value as a function** translates to [`render`](../core-features/render.md) factory:

    ```javascript
    import { render } from 'hybrids';

    { content: () => { ... } }
    // Translates to:
    { content: render(() => {...}, { shadowRoot: false }) }
    ```

2. **The descriptor value as a function** translates to the descriptor with get method:

    ```javascript
    { propertyName: () => {...} }
    // Translates to:
    { propertyName: { get: () => {...} } }
    ```

3. **The descriptor value set as a primitive or an array instance** translates to [`property`](../core-features/property.md) factory:

    ```javascript
    import { property } from 'hybrids';

    // String, Number, Boolean, ...
    { propertyName: 'text' }  
    // Translates to:
    { propertyName: property('text') }

    // Array instance
    { propertyName: ['one', 'two'] }
    // Translates to:
    { propertyName: property(['one', 'two']) }
    ```

Despite the factories and translation concepts, you can always define property using descriptor. The only requirement is that it must be an object instance (instead of a function reference, an array instance or primitive value). Also, the translation process does not change the original structure of the definition. The library translates properties when elements are defined. It can be helpful for unit testing definitions.

## Lifecycle

The lifecycle of the component is reversed comparing to other solutions. What usually would be an effect of state computation is here a cause for that computation. Every property (including `render`) is independent. If property requires other values, only then those properties are calculated. All of the values are cached, and they track own dependencies from other properties.

We can illustrate the lifecycle with the following diagram:

![Lifecycle with cache and change detection](https://raw.githubusercontent.com/hybridsjs/hybrids/master/docs/assets/lifecycle.svg?sanitize=true)

The render property (an update function, which manipulates DOM) requires current state taken from other properties - not the opposite. Setting the state within some lifecycle callback (even asynchronously fetched data) is not needed. Change detection mechanism allows triggering update function only when one of the component properties changes.

In the result, we can easily create a component structure as a list of properties (inputs) and pure render function (output) that reflects the current state of the component to the DOM.

In that concept, side effects are outside of the component scope. They are outcomes of the user input or other DOM events attached to the internal structure of the component. Render pattern used in the library allows to implemented them as ordinary functions, that take custom element instance and change property values (inputs). Those changes will eventually cause render property to update, but only when it is required.

## Customized Built-in Elements

The descriptor concept decouples component definition from its corresponding class constructor. Property descriptors are independent - they can be easily shared between definitions. Because of that, they can't depend on the specific base class, like `HTMLAnchorElement`, so the library always uses `HTMLElement` as a base class.

Because of that, [Customized built-in elements](https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements#Customized_built-in_elements) are not supported, and only [autonomous custom elements](https://developer.mozilla.org/docs/Web/Web_Components/Using_custom_elements#Autonomous_custom_elements) can be defined. However, you can easily create custom element containing built-in elements:

```javascript
const MyLink = {
  href: "",
  render: ({ href }) => html`<a href="${href}">...</a>`,
};
```

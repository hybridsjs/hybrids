# Translation

You can always define properties using [property descriptor](descriptors.md) objects. However, the translation concept provides a set of rules for translating the definition that does not match property descriptor structure (an object with `get`, `set`, `connect` or `observe` methods).

The translation expands shorter syntax or applies built-in factories using passed values. The translation is done in the following order:

1. **`render` key descriptor with value as a function** translates to [`render`](../built-in-factories/render.md) factory:

    ```javascript
    import { render } from 'hybrids';

    { render: () => { ... } }
    // Translates to:
    { render: render(() => {...}) }
    ```

2. **The descriptor value as a function** translates to the descriptor with get method:

    ```javascript
    { propertyName: () => {...} }
    // Translates to:
    { propertyName: { get: () => {...} } }
    ```

3. **The descriptor value set as a primitive or an array instance** translates to [`property`](../built-in-factories/property.md) factory:

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

**The translation process does not change the original structure of the definition.** The library translates it when an element is defined. As the result, custom element definition can be just a simple structure of default values and methods without external dependencies. For example, the definition in the original shape can be extracted for unit tests.

Instead of explicit usage of the `property` and `render` factories:

```javascript
import { property, render, html } from 'hybrids';

export const MyElement = {
  count: property(0),
  render: render(({ count }) => html`
    <button>${count}</button>
  `),
}
```

You can write a component definition without them (using translation):

```javascript
import { html } from 'hybrids';

export const MyElement = {
  count: 0,
  render: ({ count }) => html`
    <button>${count}</button>
  `,
}
```
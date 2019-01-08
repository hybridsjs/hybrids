# Translation

You can always define properties using [property descriptor](descriptors.md) objects. However, the translation concept provides a set of rules for translating the definition that does not match property descriptor structure. The value can be a primitive, a function, or even an object, but without get and set methods.

The translation expands shorter syntax or applies built-in factories using passed values. The translation is done in the following order:

1. **`render` key value as a function.** It translates to `render` factory:
    ```javascript
    import { render } from 'hybrids';

    { render: () => { ... } }
    // Translates to:
    { render: render(() => {...}) }
    ```
2. **The value as a function**. It translates to the descriptor with get method:
    ```javascript
    { propertyName: () => {...} }
    // Translates to:
    { propertyName: { get: () => {...} } }
    ```
3. **The value set as a primitive**. It translates to `property` factory:
    ```javascript
    import { property } from 'hybrids';

    { propertyName: 'text' } // String, Number, Boolean, ...
    // Translates to:
    { propertyName: property('text') }
    ```
4. **The value as an object without `get`, `set` and `connect` properties.** It translates to `property` factory:
    ```javascript
    import { property } from 'hybrids';

    { propertyName: [] }
    // Translates to:
    { propertyName: property([]) }
    ```

The translation process does not change the original structure of the definition. The library translates it when an element is defined. Custom element definition can be just a simple structure of default values and methods without external dependencies.

Instead of defining something like this:

```javascript
import { property, render, html } from 'hybrids';

export const MyElement = {
  count: property(0),
  render: render(({ count }) => html`
    <button>${count}</button>
  `),
}
```

You can write a component definition without explicit import of `property` and `render` factories:

```javascript
import { html } from 'hybrids';

export const MyElement = {
  count: 0,
  render: ({ count }) => html`
    <button>${count}</button>
  `,
}
```
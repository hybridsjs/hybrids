# Dependencies

Update function provides a helper method for resolving dependencies dynamically in templates, which use other custom elements. It uses `define` function from the library, so its API is similar to described in the [Definition](../core-concepts/definition.md) section. However, to properly work with templates it returns template update function, rather than a constructor or a map of constructors.

Resolving dependencies avoids defining not required elements and allows creating a tree-like dependency structure. A complex structure may require only one explicit definition at the root level. As the library factories decouple tag name from the definition, elements can have custom names.

```typescript
html`...`.define(map: Object): Function
```

* **arguments**:
  * `map` - object with hybrids definitions or custom element's constructors
* **returns**:
  * update function compatible with content expression 

```javascript
import UiHeader from './UiHeader';

const UiCard = {
  withHeader: false,

  render: ({ withHeader }) => html`
    <div>
      ${withHeader && html`
        <ui-header>...</ui-header>
      `.define({ UiHeader })}
      ...
    </div>
  `,
};
```

In the above example, the customer of the `UiCard` element does not have to define `UiHeader` explicitly. It is defined inside of the rendering process, and only if `withHeader` resolves to `true`.
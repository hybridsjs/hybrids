# Resolving Dependencies

For templates, which use other custom elements, update function provides helper method for resolving dependencies dynamically. It uses `define` method, so its API is the same as explained in the [Definition](../core-concepts/definition.md) section of the documentation. However, to properly work with templates it returns template update function, rather than a constructor or a map of constructors.

It helps to avoid defining not required elements and allows creating a tree-like dependency structure. A complex structure may need only one explicit definition at the root level. As the library factories decouple tag name from the definition, elements can have custom names.

**`` html`...`.define(map: Object) ``**

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

In the above example, the customer of the `UiCard` element does not have to define `UiHeader` explicitly. It will be defined and processed inside of the rendering process (and only if `withHeader` resolves to `true`).

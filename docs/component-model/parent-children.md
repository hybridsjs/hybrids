# Parent & Children

Parent and children factories connect related elements with the property.

Rather than using a custom element tag name, access to parent or children elements is made by the reference to the component definition containing property descriptors. It allows avoiding name collision between custom elements, as it is irrelevant on what name those custom elements are defined.

The relation can be created only between custom elements defined by the library. Built-in elements or other custom elements are not supported.

## Parent

```typescript
parent(componentOrFn: Object | Function: (component, host) => {...}: Boolean): Object
```

* **arguments**:
  * `componentOrFn` - reference to an object containing property descriptors or a function, which returns `true` when current `component` meets the condition
* **returns**:
  * a property descriptor, which resolves to `null` or `Element` instance

Parent factory connects a custom element in the upper DOM tree up to the `document.body` level (crossing Shadow DOM boundary). The relation updates when the custom element is connected and disconnected.

Resolved parent custom element can be safely used in other properties of the component. If one of the parent properties invalidates, a value of the related property is invalidated as well.

In the following example, `label` uses a `count` property of the `AppStore`. The value of `label` is invalidated and recalculated when `count` changes:

```javascript
import { define, parent, html } from "hybrids";

const MyParent = define({
  tag: "my-parent",
  count: 0,
});

define({
  tag: "my-element",
  ref: parent(MyParent),
  render: ({ ref }) => html`count: ${ref.count}`,
});
```

```html
<my-parent count="42">
  <my-element></my-element>
</my-parent>
```

## Children

```typescript
children(componentOrFn: Object | Function: (component, host) => {...}: Boolean, [options: Object]): Object
```

* **arguments**:
  * `componentOrFn` - reference to an object containing property descriptors or a function, which returns `true` when current `component` meets the condition
  * `options` - object with available keys:
    * `deep` - boolean, defaults to `false`
    * `nested` - boolean, defaults to `false`
* **returns**:
  * a property descriptor, which resolves to `array` of `Element` instances

Children factory connects children elements (only from the light DOM). Without options, only direct children of the element are in the list. `deep` option allows traversing
deeper children. `nested` option allows adding nested children of that element if the condition is met (`nested` option works only with `deep` option turned on). It invalidates when the subtree of the element changes.

```javascript
import { define, children } from "hybrids";

const TabItem = define({
  tag: "tab-item",
  name: "",
  active: false,
  ...
});

define({
  tag: "tab-group",
  tabs: children(TabItem),
  active: ({ tabs }) => tabs.find((tab) => tab.active),
  ...
});
```

```html
<tab-group>
  <tab-item name="one"></tab-item>
  <tab-item name="two" active></tab-item>
</tab-group>
```

## Complex Conditions

```javascript
const MyElement = define({
  tag: "my-element"
  // reference self - useful for tree-like structures
  parent: parent(component => component === MyElement),

  // any children, that has `value` property
  items: children(component => component.hasOwnProperty("value")),
});
```

Use a `function` as an argument for complex conditions. For example, you can check if a part of the component definition contains specific property, or you can use it for self-reference.

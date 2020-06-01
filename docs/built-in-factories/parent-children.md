# Parent & Children

Parent and children factories connect related elements with the property definition.

Rather than using a custom element tag name, access to parent or children elements is made by the reference to an object containing property descriptors. This feature allows avoiding name collision between custom elements because it is irrelevant on what name those custom elements are defined.

However, the relation can be created only between custom elements defined by the library. Built-in elements or other custom elements are not supported.

## Parent

```typescript
parent(hybridsOrFn: Object | Function: (hybrids) => {...}: Boolean): Object
```

* **arguments**:
  * `hybridsOrFn` - reference to an object containing property descriptors or a function, which returns `true` when current `hybrids` meets the condition
* **returns**: 
  * a property descriptor, which resolves to `null` or `Element` instance 

Parent factory connects a custom element (defined with `hybrids`) in upper DOM tree up to `document.body` level (crossing Shadow DOM boundary). The relation updates when the custom element is connected and disconnected.

Resolved parent custom element can be safely used in other properties. If one of the parent property invalidates, a value of the related properties is invalidated as well.

In the following example, `label` relates to `count` property of the `AppStore`. The value of `label` is invalidated and recalculated when `count` changes:

```javascript
import { parent } from 'hybrids';

const AppStore = {
  count: 0,
};

const MyElement = {
  store: parent(AppStore),
  label: ({ store: { count } }) => `store count: ${count}`,
}
```

```html
<app-store count="42">
  <my-element></my-element>
</app-store>
```

> Click and play with parent factory example, which creates shared state between components:
>
> [![Edit <app-todos> web components built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/app-todos-web-components-built-with-hybrids-library-behpb?file=/src/index.js)

## Children

```typescript
children(hybridsOrFn: Object | Function: (hybrids) => {...}: Boolean, [options: Object]): Object
```

* **arguments**:
  * `hybridsOrFn` - reference to an object containing property descriptors or a function, which returns `true` when current `hybrids` meets the condition
  * `options` - object with available keys:
    * `deep` - boolean, defaults to `false`
    * `nested` - boolean, defaults to `false`
* **returns**:
  * a property descriptor, which resolves to `array` of `Element` instances

Children factory connects children elements (only from the light DOM). Without options, only direct children of the element are in the list. `deep` option allows traversing
deeper children. `nested` option allows adding nested children of that element if the condition is met (`nested` option works only with `deep` option turned on).

In the same way, as parent factory works, it invalidates a list when a property of one of the elements from the list invalidates:

```javascript
import { children } from 'hybrids';

const TabItem = {
  name: '',
  active: false,
  ...
};

const TabGroup = {
  tabs: children(TabItem),
  active: ({ tabs }) => tabs.find((tab) => tab.active),
  ...
};
```

```html
<tab-group>
  <tab-item name="one"></tab-item>
  <tab-item name="two" active></tab-item>
</tab-group>
```

> Click and play with above children factory example:
>
> [![Edit <tab-group> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/tab-group-web-component-built-with-hybrids-library-e2t3e?file=/src/index.js)

## Complex Conditions

```javascript
const MyElement = {
  parent: parent(hybrids => hybrids === MyElement),
  // or
  items: children(hybrids => hybrids === MyElement),
};
```

Use a `function` as an argument for complex conditions. For example, you can check if a part of the hybrids contains specific property, or you can use it for self-reference.

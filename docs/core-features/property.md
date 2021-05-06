# Property

```javascript
import { property } from "hybrids";
```

Property factory provides the most basic feature - it holds the property value. It fallbacks to the corresponding attribute, and it protects the type by smart value transformation.

## Usage

```typescript
property(defaultValue: any, [connect: Function]): Object
```

* **arguments**:
  * `defaultValue` - any value
  * `connect` - a connect callback function of the property descriptor
* **returns**:
  * a property descriptor, which resolves to value

```javascript
import { property } from 'hybrids';

const MyElement = {
  value: property('text'),
};
```

### Translation

You can omit explicit usage of the property factory by one of the [translation](../getting-started/concepts.md#translation) rules. If the property definition is a primitive or an array instance, the property factory will be used implicitly:

```javascript
const MyElement = {
  noTransform: undefined,
  object: null,
  number: 0,
  string: "",
  boolean: false,
  array: [],
};
```

!> The translation does not work for plain objects and functions, so you must use `property({ ... })` or `property(myFn)` explicitly.

### Value Transformation

The factory uses a transform function, which protects strict type of the value set by property or an attribute.

The type of `defaultValue` is used to detect the transform function. For example, when `defaultValue` is set to `"text"`, `String` function is used. On the other hand, if the `defaultValue` is a function, it is used to transform property value.

The following list shows mapping between types of the `defaultValue` and transform functions:

* `"string"` -> `String(value)`
* `"number"` -> `Number(value)`
* `"boolean"` -> `Boolean(value)`
* `"function"` -> `defaultValue(value)`
* `"object"` -> `Object.freeze(value)`
* `"undefined"` -> `value`

Object values are frozen to prevent mutation of their properties, which does not invalidate cached value. The `defaultValue` is shared between custom element instances, so any of them cannot change it.

To omit the transform function, set `defaultValue` to `undefined`.

The below example uses `moment` library as a function for `defaultValue` to transform `date` property value:

```javascript
import { property, html } from 'hybrids';
import moment from 'moment';

const MyElement = {
  date: property(moment),
  render: ({ date }) => html`
    <p>${date.format("ddd, hA")}</p>
  `,
};
```

```html
<my-element date="2018-01-01"></my-element>
```

## Attribute Fallback

The property factory for all types except `object` and `undefined` creates fallback connection to attribute by the dashed version of the property key. The value from existing attribute is used for setting the value **only once when an element connects for the first time to the document**. However, the primitive values (strings, numbers and booleans) are set back to the corresponding attribute when property changes. It means, that for those types, the attribute is in sync with the property (but not the opposite) - it allows using property values as host styling selectors.

Still, if you want to update property value you must assert new value to the property:

```javascript
const MyElement = {
  someValue: 0,
  render: () => html`
    <slot></slot>
  `.css`
    :host([some-value="100"]) { color: red }
  `,
};
```

Attributes should be used only for setting static values in HTML templates:

```html
<my-element some-value="100"></my-element>
```

Use property assertion to dynamically change the value:

```javascript
// WRONG - it won't change property value
myElement.setAttribute('some-value', 1000);

// CORRECT - it will change property value
myElement.someValue = 1000;

// after next RAF (by the observe() API) for primitive types
myElement.getAttribute("some-value") === 1000 // returns true
```

### Booleans

The factory follows HTML standard when transforming attributes to `boolean` type. An empty attribute is interpreted as `true` (attribute exists). For setting `false` by the attribute you must not set attribute at all. It means, that if you want to support boolean attribute fallback, it is the best to set the default value to `false`.

For example, if you want to create on / off switch, depending on default value create `on` or `off` property with `false` default value.

```html
<!-- turn off (on: false) by default -->
<my-element on></my-element>

 <!-- turn on (off: false) by default -->
<my-element off><my-element>
```

However, in templates created by the built-in template engine you can set `false` value regardless of the default value:

```javascript
html`
  <my-element mySwitch="${false}"></my-element>
`
```

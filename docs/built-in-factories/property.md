# Property

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

Property factory holds a property value with the type transform with fallback to the corresponding attribute value.

### Translation

The [translation](../core-concepts/translation.md) allows using property factory implicitly. You can set a property as a primitive or an array to create descriptor by the property factory under the hood:

```javascript
const MyElement = {
  value: 0,
  items: [],
};
```

## Transform

`property` factory uses a transform function, which ensures the strict type of the value set by property or an attribute.

The type of `defaultValue` is used to detect the transform function. For example, when `defaultValue` is set to `"text"`, `String` function is used. If the `defaultValue` is a function, it is called when a property value is set.

### Transform Types

* `string` -> `String(value)`
* `number` -> `Number(value)`
* `boolean` -> `Boolean(value)`
* `function` -> `defaultValue(value)`
* `object` -> `Object.freeze(value)`
* `undefined` -> `value`

Object values are frozen to prevent mutation of their properties, which does not invalidate cached value. Moreover, `defaultValue` is shared between custom element instances, so any of them should not change it.

To omit transform, `defaultValue` has to be set to `undefined`.

The following example uses `moment` library as a function for `defaultValue` to transform `date` property value:

```javascript
import moment from 'moment';
import { property } from 'hybrids';

const MyElement = {
  date: property(moment),
};
```

```html
<my-element date="2018-01-01"></my-element>
```

## Attribute Fallback

All detected types except `object` and `undefined` create a fallback connection to element attribute with a dashed name of the property key:

```javascript
const MyElement = {
  someValue: 0,
};
```

```html
<my-element some-value="100"></my-element>
```

An attribute value is used **only once when an element connects for the first time to the document**. Attributes should be used to set static values in HTML templates. Only properties can dynamically update them:

```javascript
// Wrong (it does not change property value)
myElement.setAttribute('some-value', 1000);

// Correct (it changes property value)
myElement.someValue = 1000;
```

### Boolean Values

The library follows HTML specification and transforms attribute to `boolean` or `string` values. For example, if your `show` property `defaultValue` is set to `false` (it has `boolean` type), you can use your element like this:

```html
<my-element show></my-element>
```
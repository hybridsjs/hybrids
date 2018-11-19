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

Property factory provides two main features. It holds a property value with the type transformation and it fallbacks to the corresponding attribute value.

The [translation](../core-concepts/translation.md) has two rules, that use property factory. You can set property value as primitive or an object without get and set methods to define it using property factory.

## Transform

`property` uses a transform function, which ensures the strict type of the value set by an attribute or a property. 

The type of a passed `defaultValue` is used to detect transform function. For example, when `defaultValue` is set to `"text"`, `String` function is used. If the `defaultValue` is a function, it is called when a property value is set.

### Transform Types

* `string` -> `String(value)`
* `number` -> `Number(value)`
* `boolean` -> `Boolean(value)`
* `function` -> `defaultValue(value)`
* `object` -> `Object.freeze(value)`
* `undefined` -> `value`

Object values are frozen to prevent mutation of the own properties, which does not invalidate cached value. Moreover, `defaultValue` is shared between custom element instances, so any of them should not change it.

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

All transform types except `object` and `undefined` create a fallback connection to element attribute (with dashed name of the property key):

```javascript
const MyElement = {
  someValue: 0,
};
```

```html
<my-element some-value="100"></my-element>
```

An attribute value is used **only once when an element connects for the first time to the document**. It means that attributes can be used to set static values in HTML templates, but only properties can dynamically update them:

```javascript
// Wrong (it does not change property value):
myElement.setAttribute('some-value', 1000);

// Correct (it changes property value):
myElement.someValue = 1000;
```

### Boolean Values

The library follows HTML specification and transforms attribute to `boolean` or `string` values. For example, if your `show` property `defaultValue` is set to `false` (it has `boolean` type), you can use your element like this:

```html
<my-element show></my-element>
```
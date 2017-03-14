# Attribute & Property Mapping

Core provides two-way data binding between custom element and hybrid component. Attribute and property mapping is essential to create public API for hybrid components. By default, everything is private and only component instance has access to it.

To specify public API use **properties** option:

```javascript
class MyElement {
  static get options() {
    return {
      properties: ['one', { property: 'two', attr: false }]
    }
  }
}
```

`properties` can be set in two ways, as:

* **string value** `['one', 'two', ...]` - shorthand for common configuration, it equals to `{ property: 'one' }`
* **object descriptor** `[{ ... }, ...]` with following keys:
  * `property`:`string` - required, hybrid component property name
  * `attr` : `string|false` - attribute name, defaults to `property` transformed to dash-case 
  * `reflect` : `true|false` - set if attribute reflects property change, defaults to `false` \(works only with `boolean` values\)

## Properties

```javascript
import { define } from '@hybrids/core';

class MyElement {
  static get options() {
    return {
      properties: ['value', 'myMethod']
    }
  }

  constructor() {
    this.value = 'my value';
  }

  myMethod() {
    window.alert('do something');
  }
}

const HTMLMyElement = define('my-element', MyElement);
const el = new HTMLMyElement(); // creates <my-element> element

// Logs component value property
console.log(el.value); // outputs: 'my value'

// Will open alert with message 'do something'
el.myMethod();
```

Property mapping creates connection between custom element property and hybrid component. It means, that custom element is a proxy to component logic.

If property is a prototype method, only `property` option is used, rest is omitted.

## Attributes

Unlike the properties, attributes don't reflect value changes. Component property is updated when attribute is changed, but not in opposite way. However, in most cases, user of the custom element don't need to rely on attribute changes when element property is changed.

Only exception to this rule is for `boolean` value. If property type is `boolean`, it can be reflected to HTML5 attribute value \(attribute exists or is removed\).

The `reflect` option works only for those properties.

```javascript
class MyElement {
  static get options() {
    return {
      properties: [{ property: 'small', reflect: true }]
    };
  }

  constructor() {
    this.small = false;
  }
} 

...
el = new HTMLMyElement();
el.small = true;
```

Element then will look like this:

```html
<my-element small></my-element>
```

## Type Reflection

Most important feature of mapping is the type reflection. When attribute or custom element property is changed, your component property will be updated with a type, which was used in `constructor()` method:

```javascript
class MyElement {
  static get options() {
    return {
      properties: ['value']
    };
  }

  constructor() {
    // type of the initial value will be used for further updates
    this.value = 100; 
  }
} 

...
console.log(el.value); // outputs: 100

el.value = "2000"; // string
console.log(el.value) // outputs: 2000 (number)

el.value = {};
console.log(el.value) // outputs: NaN (number)
```

Also, attribute value will update component property with a right type:

```html
<my-element id="el" value="350"></my-element>
<script>
  console.log(document.getElementById('el').value); // outputs: 350 (number)
</script>
```

### Transform Table

| Initial Type | Reflection |
| --- | --- |
| `string` | `String(value)` |
| `number` | `Number(value)` |
| `boolean` | `Boolean(value)` |
| `object` | `JSON.parse(value)` for `string` values, otherwise `Object(value)` |
| `function`, `symbol` | `value` \(when type matches\) |
| `undefined` | `value` \(no reflection\) |

### Validation Errors

If type reflection fails \(applies only to `object`, `function` and `symbol` types\), `TypeError` is thrown, which protects component from inconsistent state.


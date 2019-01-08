# Properties & Attributes

```javascript
html`<div propertyName="${value}"></div>`;
```

Expression in the attribute set corresponding property of an element instance. Even though attributes are not case-sensitive, the template engine uses the exact name defined in the template.

## Attribute Fallback

If the property is not found in the prototype of an element, it fallbacks to attribute value. The attribute name is not translated from camel-case to dash or in another way. If your template contains a custom element, which only supports attributes, you can use the original name:

```javascript
html`<external-calender start-date="${myDate}"></external-calender>`
```

Custom elements defined with the hybrids support property and attribute value (with the dashed name):

```javascript
// Attribute: static value, but only a string
html`<my-calendar start-date="2020-01-01"></my-calendar>`;

// Property: static value, any type
html`<my-calendar startDate=${[2020, 1, 1]}></my-calendar>`;

// Property: the only way to create dynamically changing value
html`<my-calendar startDate=${dynamicDate}></my-calendar>`;
```

Even though you can use attributes, the preferred way is to pass values using properties for static and dynamic content. If you consider performance issues, you can fallback to attribute with static string value and avoid creating an additional dynamic part in the template.

## Mixed Values

If the attribute value contains additional characters or multiple expressions, then the engine fallbacks to attribute value with concatenated characters. It has precedence even over the following behaviors.

```javascript
html`<div id="el" class="button ${buttonType} ${buttonColor}"></div>`
```

## Special Cases

The default action for `class` and `style` attributes would not work as expected, as they are implemented differently in the DOM. `class` attribute is reflected to `classList` and `className` properties. And, `style` property returns `CSSStyleDeclaration` rather than simple string value. Because of that, the template engine supports them differently.

### Class

`class` attribute expression allows adding and removing class names from an element's `classList`. An expression can be a string, an array of strings or a map of keys with boolean values:

```javascript
const name = 'one two';
const array = ['one', 'two'];
const map = { one: true, two: false };

html`<div class="${name || array || map}"></div>`;
```

### Style

`style` attribute expression sets style properties by the `CSSStyleDeclaration` API. An expression has to be an object with dashed or camel-case keys with values.

```javascript
const styles = {
  backgroundColor: 'red',
  'font-face': 'Arial',
};

html`<div style="${styles}"></div>`;
```

However, the preferred way to style elements is using `<style>` element inside of the template body. Read more in [Styling](styling.md) section.

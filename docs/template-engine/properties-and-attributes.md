# Properties & Attributes

```javascript
html`<div propertyName="${value}"></div>`;
```

Expression in the attribute set corresponding property of an element instance. Even though attributes are not case-sensitive, the template engine uses the exact name defined in the template.

## Attribute Fallback

If the property name is not found in the prototype of an element, it fallbacks to attribute value. The attribute name is not translated from camel-case to dash or yet another type. For example, if you use a custom element, which only supports attributes, use the original name:

```javascript
html`<external-calender start-date="${myDate}"></external-calender>`
```

Custom elements defined with the hybrids support both, properties and attribute values (with the dashed name). An attribute fallback should be used only for static values:

```javascript
html`<my-calendar start-date="2020-01-01"></my-calendar>`;
```

Dynamic expressions should use property name:

```javascript
html`<my-calendar startDate=${dynamicDate}></my-calendar>`;
```

## Mixed Values

Multiple expressions defined in the one property always set attribute (never a property) with concatenated `string` value. It is never set a property, even for special cases described in following sections.

```javascript
html`<div id="el" class="button ${buttonType} ${buttonColor}"></div>`
```

## Special Behavior

The default behavior for `class` and `style` would not work as expected, as they are implemented differently in the DOM. `class` attribute is reflected to `classList` or `className` properties. And, `style` property returns `CSSStyleDeclaration` rather than simple string value. Because of that, the template engine supports them differently.

### Class

`class` attribute expression allows adding and removing class names from an element's `classList`. An expression can be a string, an array of strings or a map of keys with boolean values:

```javascript
const name = 'one two';
const array = ['one', 'two'];
const map = { one: true, two: false };

html`<div class="${name || array || map}"></div>`;
```

### Style

`style` attribute expression set style properties by the `CSSStyleDeclaration` API. An expression has to be an object with dashed or camel-case keys with values.

```javascript
const styles = {
  backgroundColor: 'red',
  'font-face': 'Arial',
};

html`<div style="${styles}"></div>`;
```

However, the preferred way to style elements is using `<style>` element inside of the template body:

```javascript
const MyElement = {
  render: () => html`
    <style>
      div { background-color: red }
    </style>
    <div>...</div>
  `,
};
```

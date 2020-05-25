# Styling

To style your custom element, you can create `<style>` elements directly in the template, use a nested template with styles, or pass text content of CSS file.

## Style Element

Create `<style>` element inside of the main template passed to `render` factory:

```javascript
const MyElement = {
  render: () => html`
    <div>...</div>
    <style>
      div { color: red }
    </style>
  `,
};
```

Styles are scoped and apply only to the elements in the `shadowRoot` for default render property configuration.

### Limitations

In the browser, which doesn't support Shadow DOM, ShadyCSS is used to create scoped CSS. The shim moves out `<style>` element from the template, scopes selectors and puts styles into the head of the document. It is done once, and before expressions are calculated, so expressions inside the style element cannot be processed correctly.

Expressions inside of the `<style>` element are only supported in native implementation of the Shadow DOM. Although, creating dynamic styles can be inefficient (styles are not shared between elements instances) and opens possibility for a XSS attack (for insecure inputs).

#### Breaks template: (using ShadyCSS) <!-- omit in toc -->

```javascript
html`
  <style>
    div { color: ${user ? 'blue' : 'black'}; }
  </style>
  <div>Color text</div>
`;
```

#### Works fine: <!-- omit in toc -->

```javascript
html`
  <style>
    div { color: black; }
    div.user { color: blue; }
  </style>
  <div class="${{ user }}">Color text</div>
`
```

## Nested Template

Create a [nested template](nested-templates.md) with `<style>` element for sharing styles between custom elements (the style elements still are created for each instance of the custom element):

```javascript
const commonStyles = html`
  <style>
    :host { display: block }
    :host[hidden] { display: none }
  </style>
`;

const MyElement = {
  render: () => html`
    <div>...</div>
    ${commonStyles}
    <style>
      div { color: red }
    </style>
  `,
};
```

## CSS Stylesheet

For external CSS content, use `style` helper method from the result of the `html` or `svg` function:

```typescript
html`...`.style(...styles: Array<string | CSSStyleSheet>): Function
```

* **arguments**:
  * `styles` - a list of text contents of CSS stylesheets, or instances of `CSSStyleSheet` (only for constructable stylesheets)
* **returns**:
  * an update function compatible with content expression

Style helper works the best with bundlers, which support importing text content of the CSS files (for [webpack](https://github.com/webpack/webpack), use [raw-loader](https://github.com/webpack-contrib/raw-loader). Do not use `css-loader` or `style-loader` like you may be used to, as either will interfere with the ability to parse the stylesheet). Still, you can create a string input in-place, and pass it to the style helper.

```javascript
// `styles` should contain text content of the CSS
import globals from '../globals.css';
import styles from './MyElement.css';

const inlineStyles = `
  div { color: red }
`;

const MyElement = {
  render: () => html`
    <div>...</div>
  `.style(globals, styles, inlineStyles),
};
```

The style helper supports passing `CSSStyleSheet` instance, but it will work only for the described below mode. Do not use it if you target multiple environments, where it might not be yet supported.

### Constructable Stylesheets

If the browser supports [Constructable Stylesheets](https://wicg.github.io/construct-stylesheets/) and the following conditions are met, the style helper creates and adopts a list of `CSSStyleSheet` instances insted of creating `<style>` tag:

* The CSS content must not include `@import` statement (it was recently [deprecated](https://github.com/WICG/construct-stylesheets/issues/119#issuecomment-588352418) for Constructable Stylesheets)
* The `html``.style()` helper must be called for the root template of the custom element (it fallbacks to `<style>` element for nested templates)

For the string input the template engine creates an instance of `CSSStyleSheet` only once, and share it among the all instances of the custom element (you can also pass the `CSSStyleSheet` instance, but then you must take care of the browser support by yourself).

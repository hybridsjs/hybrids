# Styling

To style your custom element, you can create `<style>` element directly in the template, use a nested template with styles, or pass text content of CSS file.

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

Styles are scoped by default and apply only to the elements in the `shadowRoot`.

### Limitations

In the browser, which doesn't support Shadow DOM, ShadyCSS is used to create scoped CSS. The shim moves out `<style>` element from the template, scopes selectors and puts styles into the head of the document. It is done once, and before expressions are calculated, so expressions inside the style element cannot be processed correctly.

Expressions inside of the `<style>` element are only supported in native implementation of the Shadow DOM. Although, creating dynamic styles can be inefficient (styles are not shared between elements instances).

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

Create [nested template](nested-templates.md) with `<style>` element for sharing styles between custom elements:

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

For external CSS content, use `style` helper method from the result of the `html` or `svg`:

  ```typescript
  html`...`.style(styles: string, [styles: string]...): Function
  ```

  * **arguments**:
    * `styles` - text content of CSS stylesheet
  * **returns**:
    * update function compatible with content expression 

Style helper works the best with bundlers, which support importing text content of the CSS files (for [webpack](https://github.com/webpack/webpack), use [raw-loader](https://github.com/webpack-contrib/raw-loader).

```javascript
// `styles` should contain text content of CSS file
import styles from './MyElement.css';

const MyElement = {
  render: () => html`
    <div>...</div>
  `.style(styles),
};
```

### webpack Config

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['raw-loader']
      }
    ]
  }
}
```

## Preprocessors (PostCSS, Sass, etc.)

If using external stylesheets (above), you can add a preprocessor such as [PostCSS](https://github.com/postcss/postcss) using a webpack config. You can alternately use `"sass-loader"` for Sass.

It’s important **not** to use `css-loader` or `style-loader` like you may be used to, as either will interfere with Hybrid’s ability to parse the stylesheet.

### Installation

```bash
npm install --save-dev raw-loader postcss postcss-loader postcss-preset-env
```

### webpack Config

```js
const postcssPresetEnv = require("postcss-preset-env"); // optional; for example (below)

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'raw-loader',
          {
            loader: 'postcss-loader',
            // This is optional; just showing an example of a plugin w/ options
            options: {
              plugins: () => [postcssPresetEnv({ 'nesting-rules': true })]
            }
          }
        ]
      }
    ]
  }
}
```

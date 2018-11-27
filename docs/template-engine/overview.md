# Overview

The inspiration for the template engine was the [lit-html](https://github.com/Polymer/lit-html) library, but the implementation is different and it follows own conventions.

The engine provides `html` and `svg` functions for defining templates (both have the same interface, but `svg` uses SVG namespace). They use tagged template literals syntax to create DOM and update dynamic parts leaving static content untouched.

For the best development experience, check if your code editor supports highlighting HTML in tagged template literals.

## html

```typescript
html`<div property="${value}">${value}</div>` : Function
```

* **arguments**:
  * HTML content as a template content
  * `value` - dynamic values as a property values or element content
* **returns**:
  * an update function, which takes `host` and `target` arguments


```javascript
import { html } from 'hybrids';

const update = ({ value }) => html`
  <div>${value}</div>
`;
```

## svg

```typescript
svg`<circle property="${value}">${value}</circle>` : Function
```

* **arguments**:
  * SVG content as a template content
  * `value` - dynamic values as a property values or element content
* **returns**:
  * an update function, which takes `host` and `target` arguments

```javascript
import { html, svg } from 'hybrids';

const update = ({ radius }) => html`
  <svg viewBox="0 0 300 100">${
    svg`<circle cx="50" cy="50" r="${radius}" />`
  }</svg>
`;
```

`<svg>` container element has to be created with `html` function. Use `svg` function only for creating internal structure of the `<svg>` element.


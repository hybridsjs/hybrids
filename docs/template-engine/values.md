# Values

An expression with `string`, `number` and `object` value in the body of an element resolves to `textContent`:

```javascript
html`<div>Name: ${name}, Count: ${count}</div>`;
```

HTML code can be created by the `innerHTML` property. However, use it with caution, as it might open XSS attack:

```javascript
// Use it with caution, it might open XSS attack
html`<div innerHTML="${htmlCode}"></div>`;
```
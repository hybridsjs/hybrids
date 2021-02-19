# Values

An expression inside of the element, which is not a function, or a Node instance, resolves to `textContent`. Falsy values other than number `0` are not displayed (`textContent` is set to empty string). The rules apply in the same way for values of the arrays.

```javascript
html`<div>Name: ${name}, Count: ${count}</div>`;
```

HTML code can be created by the `innerHTML` property. However, use it with caution, as it might open XSS attack:

```javascript
// Use it with caution, it might open XSS attack
html`<div innerHTML="${htmlCode}"></div>`;
```

An expression with a function resolves to [nested template](./nested-templates.md).

## Nodes

If the expression returns a Node instance, it is attached to the corresponding place in the DOM. It can be useful for web components, which requires a reference to inner DOM elements:

```javascript
const MyElement = {
  // it will be called only once, as it has no deps
  canvas: () => { 
    const el = document.createElement("canvas");

    // setup canvas
    const context = el.getContext('2d');
    context.fillStyle = "rgb(255,0,0)";
    context.fillRect(30, 30, 50, 50);

    // return element
    return el;
  },
  render: ({ canvas }) => html`
    <div id="container">
      ${canvas}
    </div>
  `,
};
```

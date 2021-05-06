# Promises

Promise as a value of an expression is not supported. However, the library supports promises by the `html.resolve` method.

```typescript
html.resolve(promise: Promise, placeholder: Function, delay = 200): Function
```

* **arguments**:
  * `promise` - promise, which should resolve to content expression value
  * `placeholder` - update function for render content until promise is resolved or rejected
  * `delay` - delay in milliseconds, after which placeholder is rendered
* **returns**:
  * update function compatible with content expression

```javascript
const promise = asyncApi().then(...);

html`
  <div>
    ${html.resolve(
      promise
        .then((value) => html`<div>${value}</div>`)
        .catch(() => html`<div>Error!</div>`),
      html`Loading...`,
    )}
  </div>
`
```

> Click and play with web component example connected to external API:
>
> [![Edit <async-user> web component built with hybrids library](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/async-user-web-component-built-with-hybrids-library-fhx3j?file=/src/AsyncUser.js)
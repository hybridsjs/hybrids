# Promises

Promise as a value of an expression is not supported. However, the library supports promises by the `html.resolve` method.

```typescript
html.resolve(promise: Promise, placeholder: Function, delay = 200): Function
```

* **arguments**:
  * `promise` - promise, which should resolve/reject update function
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

👆 [Click and play with &lt;async-user&gt; custom element on ⚡StackBlitz](https://stackblitz.com/edit/hybrids-async-user?file=async-user.js)
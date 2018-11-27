# Conditions

For conditional rendering, expressions can return falsy values (the exception is number `0`) to clear previously rendered content. An expression with falsy value removes previous truthy value from the DOM and renders nothing.

```javascript
html`<div>${isValid && ...}</div>`;
```

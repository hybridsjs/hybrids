# Nested Templates

Expressions in the body of an element can return a function, which takes two arguments, `host` and `target` (text node position marker). The update function returned by the `html` is compatible with this API, and it provides creating nested templates.

```javascript
const submit = (fn) => html`
  <button onclick=${fn}>Submit</button>
`;

function myCallback(host, event) {...}

html`
  <form>
    ...
    ${submit(myCallback)}
  </form>
`;
```

In the above example `submit` function creates a template with `fn` callback. The main template can use this function in the expression with a custom callback. If so, the nested template with a button is inserted into the form element. What is important, the element instance context propagates from parent to child template.

The `host` argument of the `myCallback` would be the same as it would be used directly in the main template. This pattern allows creating template parts, that can be easily defined in separate files and re-use across different custom elements.
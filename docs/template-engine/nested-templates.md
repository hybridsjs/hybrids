# Nested Templates

Expressions in the body of an element can return a function, which takes two arguments - `host` and `target` (text node position marker). The update function returned by the `html` is compatible with this API, and it can be used to create nested templates.

```javascript
const submit = (fn) => html`
  <button type="submit" onclick=${fn}>Submit</button>
`;

function myCallback(host, event) {...}

html`
  <form>
    ...
    ${submit(myCallback)}
  </form>
`;
```

In the above example `submit` function creates a template with `fn` callback. The main template can use this function in the expression with a custom callback. If so, the nested template with a button is rendered in the form element. 

The child template propagates element instance context from the parent. The `host` argument of the `myCallback` is the same as it would be with a function used directly in the main template. This pattern allows creating template parts, that can be easily defined in separate files and re-use across different custom elements.
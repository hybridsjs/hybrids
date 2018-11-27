# Iteration

For iteration, an expression should return an `array` with a list of expressions. Items can be primitive values, nested templates as well as nested arrays.

```javascript
html`
  <todo-list>
    ${names.map((name) => `Name: ${name}`)}

    ${items.map(({ name }) => html`<todo-item>${name}</todo-item>`)}
  </todo-list>
`;
```

👆 [Click and play with todo list on ⚡StackBlitz](https://stackblitz.com/edit/hybrids-children-factory?file=index.js)

## Keys

For default, array `index` identifies expressions for re-render. However, you can use `key` method provided by the result of `html` call for efficient re-order (it sets a key and returns update function). When the list changes and a key is found, the existing template is updated rather than a new one is created.

```javascript
html`
  <todo-list>
    ${items.map(({ id, name }) => 
      html`<todo-item>${name}</todo-item>`.key(id),
    )}
  </todo-list>
`
```

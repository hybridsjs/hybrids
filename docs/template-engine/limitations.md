# Limitations

The engine tries to support all required features for creating reach HTML templates, but there are a few cases where expressions cannot be used or have some limitations.

## Table Family Elements

`<table>`, `<tr>`, `<thead>`, `<tbody>`, `<tfoot>` and `<colgroup>` elements with expressions should not have additional text other than a whitespace:

### Breaks template: <!-- omit in toc -->

```javascript
html`<tr>${cellOne} ${cellTwo} some text</tr>`;
```

### Works fine: <!-- omit in toc -->
  ```javascript
  html`<tr>${cellOne} ${cellTwo}</tr>`;
  ```

## Template Element

Expressions inside of the `<template>` element are not supported:

### Breaks template: <!-- omit in toc -->

```javascript
html`
  <custom-element>
    <template>
      <div class="${myClass}"></div>
    </template>
    <div>${content}</div>
  </custom-element>
`;
```
### Works fine: <!-- omit in toc -->

```javascript
html`
  <custom-element>
    <template>
      <div class="my-static-class"></div>
    </template>
    <div>${content}</div>
  </custom-element>
`;
```
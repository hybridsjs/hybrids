# Limitations

## Styling

In the browser, which does not support Shadow DOM, ShadyCSS is used to create scoped CSS. This process requires moving out `<style>` element from the template and put it into the head of the document. It is done once, and before expressions are calculated, so expressions inside style element are not processed correctly.

Expressions inside of the `<style>` element are only supported in native implementation of Shadow DOM. However, creating dynamic styles in the environment, which supports Shadow DOM can be inefficient (styles are not shared between elements instances).

### Breaks template: (using ShadyCSS) <!-- omit in toc -->

```javascript
html`
  <style>
    div { color: ${user ? 'blue' : 'black'}; }
  </style>
  <div>Color text</div>
`;
```

### Works fine: <!-- omit in toc -->

```javascript
html`
  <style>
    div { color: black; }
    div.user { color: blue; }
  </style>
  <div class="${{ user }}">Color text</div>
`
```

## Table Family Elements

`<table>`, `<tr>`, `<thead>`, `<tbody>`, `<tfoot>` and `<colgroup>` elements with expressions should not have additional text other than whitespace:

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
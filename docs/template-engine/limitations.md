# Limitations

The engine tries to support all required features for creating reach HTML templates, but there are a few cases where expressions cannot be used or have some limitations.

## Style Element

In the browsers, which don't support Shadow DOM, ShadyCSS is used to create scoped CSS. The shim moves out `<style>` element from the template, scopes selectors and puts styles into the head of the document. It is done once, and before expressions are calculated, so expressions inside the style element cannot be processed correctly.

Expressions inside of the `<style>` element are only supported in native implementation of the Shadow DOM. Although, creating dynamic styles can be inefficient (styles are not shared between elements instances).

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
# API Reference

The following functions are a public API of the hybrids library available as named exports:

## define

```typescript
define(tagName: string, descriptorsOrConstructor: Object | Function): Wrapper
```

* **arguments**:
  * `tagName` - a custom element tag name,
  * `descriptorsOrConstructor` - an object with a map of hybrid property descriptors or constructor
* **returns**: 
  * `Wrapper` - custom element constructor (extends `HTMLElement`)

```typescript
define({ tagName: descriptorsOrConstructor, ... }): { tagName: Wrapper, ... }
```

* **arguments**:
  * `tagName` - a custom element tag name in pascal case or camel case,
  * `descriptorsOrConstructor` - an object with a map of hybrid property descriptors or constructor
* **returns**: 
  * `{ tagName: Wrapper, ...}` - a map of custom element constructors (extends `HTMLElement`)

## property

```typescript
property(defaultValue: any, [connect: Function]): Object
```

* **arguments**:
  * `defaultValue` - any value
  * `connect` - a connect callback function of the property descriptor
* **returns**:
  * a property descriptor, which resolves to value

## parent

```typescript
parent(hybridsOrFn: Object | Function: (hybrids) => {...}: Boolean): Object
```

* **arguments**:
  * `hybridsOrFn` - reference to an object containing property descriptors or a function, which returns `true` when current `hybrids` meets the condition
* **returns**: 
  * a property descriptor, which resolves to `null` or `Element` instance 

## children

```typescript
children(hybridsOrFn: Object | Function: (hybrids) => {...}: Boolean, [options: Object]): Object
```

* **arguments**:
  * `hybridsOrFn` - reference to an object containing property descriptors or a function, which returns `true` when current `hybrids` meets the condition
  * `options` - object with available keys:
    * `deep` - boolean, defaults to `false`
    * `nested` - boolean, defaults to `false`
* **returns**:
  * a property descriptor, which resolves to `array` of `Element` instances

## render

```typescript
render(fn: Function, options: Object = { shadowRoot: true }): Object
```

* **arguments**:
  * `fn(host: Element): Function` - callback function with `host` argument; returned function has `host` and `target` arguments
  * `options: Object` - an object, which has a following structure:
    * `{ shadowRoot: true }` (default value) - initializes Shadow DOM and set `target` as `shadowRoot`
    * `{ shadowRoot: false }` - sets `target` argument as `host`,
    * `{ shadowRoot: { extraOption: true, ... } }` - initializes Shadow DOM with passed options for `attachShadow()` method
* **returns**:
  * hybrid property descriptor, which resolves to a function

## html

```typescript
html`<div property="${value}">${value}</div>` : Function
```

* **arguments**:
  * HTML content as a template content
  * `value` - dynamic values as a property values or element content
* **returns**:
  * an update function, which takes `host` and `target` arguments

```typescript
html`...`.define(map: Object): Function
```

* **arguments**:
  * `map` - object with hybrids definitions or custom element's constructors
* **returns**:
  * update function compatible with content expression 

```typescript
html`...`.style(...styles: Array<string | CSSStyleSheet>): Function
```

* **arguments**:
  * `styles` - a list of text contents of CSS stylesheets, or instances of `CSSStyleSheet` (only for constructable stylesheets)
* **returns**:
  * an update function compatible with content expression

```typescript
html.resolve(promise: Promise, placeholder: Function, delay = 200): Function
```

* **arguments**:
  * `promise` - promise, which should resolve/reject update function
  * `placeholder` - update function for render content until promise is resolved or rejected
  * `delay` - delay in milliseconds, after which placeholder is rendered 
* **returns**:
  * update function compatible with content expression 

## svg

```typescript
svg`<circle property="${value}">${value}</circle>` : Function
```

* **arguments**:
  * SVG content as a template content
  * `value` - dynamic values as a property values or element content
* **returns**:
  * an update function, which takes `host` and `target` arguments

```typescript
svg`...`.define(map: Object): Function
```

* **arguments**:
  * `map` - object with hybrids definitions or custom element's constructors
* **returns**:
  * update function compatible with content expression 

```typescript
svg`...`.style(styles: string, [styles: string]...): Function
```

* **arguments**:
  * `styles` - text content of CSS stylesheet
* **returns**:
  * update function compatible with content expression 

```typescript
svg.resolve(promise: Promise, placeholder: Function, delay = 200): Function
```

* **arguments**:
  * `promise` - promise, which should resolve/reject update function
  * `placeholder` - update function for render content until promise is resolved or rejected
  * `delay` - delay in milliseconds, after which placeholder is rendered 
* **returns**:
  * update function compatible with content expression 

## dispatch

```typescript
dispatch(host: Element, eventType: string, [options]): Boolean
```

* **arguments**:
  * `host` - element instance
  * `eventType` - type of the event to be dispatched
  * `options` - a dictionary, having the following optional fields:
    * `bubbles` - a boolean indicating whether the event bubbles. The default is false
    * `cancelable` - a boolean indicating whether the event can be cancelled. The default is false
    * `composed` - a boolean indicating whether the event will trigger listeners outside of a shadow root The default is false
    * `detail` - a custom data, which will be passed to an event listener
* **returns**:
  * `false` if event is cancelable and at least one of the event handlers which handled this event called `preventDefault()`, otherwise it returns `true`

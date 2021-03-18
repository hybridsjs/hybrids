# API Reference

The following functions are a public API of the hybrids library available as named exports:

## define

```typescript
define(tagName: string, descriptors: Object): Wrapper
```

* **arguments**:
  * `tagName` - a custom element tag name,
  * `descriptors` - an object with a map of hybrid property descriptors
* **returns**:
  * `Wrapper` - custom element constructor (extends `HTMLElement`)

```typescript
define({ tagName: descriptors, ... }): { tagName: Wrapper, ... }
```

* **arguments**:
  * `tagName` - a custom element tag name in pascal case or camel case,
  * `descriptors` - an object with a map of hybrid property descriptors
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
  * `fn(host: Element): (host, target) => {}` - a callback function with `host` argument, which returns a function with `host` and `target` arguments
  * `options: Object` - an object, which has a following structure:
    * `{ shadowRoot: true }` (default) - initializes Shadow DOM and set `target` as `shadowRoot`
    * `{ shadowRoot: false }` - sets `target` argument as `host`,
    * `{ shadowRoot: { extraOption: true, ... } }` - initializes Shadow DOM with passed options for `attachShadow()` method
* **returns**:
  * hybrid property descriptor, which resolves to a function (when called manually, it returns `target`)

## store

### direct

```typescript
store.get(Model: object, id?: string | object) : object;
```

* **arguments**:
  * `Model: object` - a model definition
  * `id: string | object` - a string or an object representing identifier of the model instance
* **returns**:
  * Model instance or model instance placeholder

```typescript
store.set(Model: object, values: object) : Promise;
```

* **arguments**:
  * `Model: object` - a model definition
  * `values: object` - an object with partial values of the model instance
* **returns**:
  * A promise, which resolves with the model instance
  
```typescript
store.set(modelInstance: object, values: object | null): Promise;
```

* **arguments**:
  * `modelInstance: object` - a model instance
  * `values: object | null` - an object with partial values of the model instance or `null` for deleting the model
* **returns**:
  * A promise, which resolves to the model instance or placeholder (for model deletion)

### factory

```typescript
store(Model: object, options?: id | { id?: string | (host) => any, draft?: boolean }): object
```

* **arguments**:
  * `Model: object` - a model definition
  * `options` - an object with the following properties or the shorter syntax with the below `id` field value
    * `id` - a `host` property name, or a function returning the identifier using the `host`
    * `draft` - a boolean switch for the draft mode, where the property returns a copy of the model instance for the form manipulation
* **returns**:
  * hybrid property descriptor, which resolves to a store model instance

### guards

```typescript
store.ready(model: object): boolean
```

* **arguments**:
  * `model: object` - a model instance
* **returns**:
  * `true` for a valid model instance, `false` otherwise

```typescript
store.pending(model: object): boolean | Promise
```

* **arguments**:
  * `model: object` - a model instance
* **returns**:
  * In pending state a promise instance resolving with the next model value, `false` otherwise

```typescript
store.error(model: object, propertyName?: string): boolean | Error | any
```

* **arguments**:
  * `model` - a model instance
  * `propertyName` - a property name of the failed validation defined with `store.value()` method
* **returns**:
  * An error instance or whatever has been thrown or `false`. When `propertyName` is set, it returns `err.errors[propertyName]` or `false`

### value

```typescript
store.value(defaultValue: string | number, validate?: fn | RegExp, errorMessage?: string): String | Number
```

* **arguments**:
  * `defaultValue` - `string` or `number` value
  * `validate` - a validation function - `validate(val, key, model)`, which should return `false`, error message or throws when validation fails, or a RegExp instance. If omitted, the default validation is used, which fails for empty string and `0`.
  * `errorMessage` - optional error message used when validation fails
* **returns**:
  * a `String` or `Number` instance

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
html`...`.css`div { color: red; padding-top: ${value}; }`: Function
```

* **arguments**:
  * CSS content in tagged template literals
  * `value` - dynamic values concatenated with the template literal
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
svg`...`.css`path { color: ${value}; }`: Function
```

* **arguments**:
  * CSS content in tagged template literals
  * `value` - dynamic values concatenated with the template literal
* **returns**:
  * an update function compatible with content expression

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

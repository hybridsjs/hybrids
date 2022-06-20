# API Reference

The following functions are a public API of the hybrids library available as named exports:

## Definition

```typescript
define(component: object & { tag: string }): component;
```

- **arguments**:
  - `component` - an object with map of hybrid property descriptors with a tag name set to `tag` property
- **returns**:
  - `component` - a passed argument to `define()` function

```typescript
define.compile(component: object): HTMLElement;
```

- **arguments**:
  - `component` - an object with map of hybrid property descriptors without `tag` property
- **returns**:
  - `HTMLElement` - a constructor for the custom element (not registered in the global custom elements registry)

## Parent

```typescript
parent(componentOrFn: Object | Function: (component, host) => {...}: Boolean): Object
```

- **arguments**:
  - `componentOrFn` - reference to an object containing property descriptors or a function, which returns `true` when current `component` meets the condition
- **returns**:
  - a property descriptor, which resolves to `null` or `Element` instance

## Children

```typescript
children(componentOrFn: Object | Function: (component, host) => {...}: Boolean, [options: Object]): Object
```

- **arguments**:
  - `componentOrFn` - reference to an object containing property descriptors or a function, which returns `true` when current `component` meets the condition
  - `options` - object with available keys:
    - `deep` - boolean, defaults to `false`
    - `nested` - boolean, defaults to `false`
- **returns**:
  - a property descriptor, which resolves to `array` of `Element` instances

## Templates

```typescript
html`<div property="${value}">${value}</div>` : Function
```

- **arguments**:
  - HTML content as a template content
  - `value` - dynamic values as a property values or element content
- **returns**:
  - an update function, which takes `host` and `target` arguments

```typescript
html`...`.define(map: Object): Function
```

- **arguments**:
  - `map` - object with hybrids definitions or custom element's constructors
- **returns**:
  - update function compatible with content expression

```typescript
html`...`.style(...styles: Array<string | CSSStyleSheet>): Function
```

- **arguments**:
  - `styles` - a list of text contents of CSS stylesheets, or instances of `CSSStyleSheet` (only for constructable stylesheets)
- **returns**:
  - an update function compatible with content expression

```typescript
html`...`.css`div { color: red; padding-top: ${value}; }`: Function
```

- **arguments**:
  - CSS content in tagged template literals
  - `value` - dynamic values concatenated with the template literal
- **returns**:
  - an update function compatible with content expression

```typescript
html.resolve(promise: Promise, placeholder: Function, delay = 200): Function
```

- **arguments**:
  - `promise` - promise, which should resolve to content expression value
  - `placeholder` - update function for render content until promise is resolved or rejected
  - `delay` - delay in milliseconds, after which placeholder is rendered
- **returns**:
  - update function compatible with content expression

```typescript
svg`<circle property="${value}">${value}</circle>` : Function
```

- **arguments**:
  - SVG content as a template content
  - `value` - dynamic values as a property values or element content
- **returns**:
  - an update function, which takes `host` and `target` arguments

```typescript
svg`...`.define(map: Object): Function
```

- **arguments**:
  - `map` - object with hybrids definitions or custom element's constructors
- **returns**:
  - update function compatible with content expression

```typescript
svg`...`.style(styles: string, [styles: string]...): Function
```

- **arguments**:
  - `styles` - text content of CSS stylesheet
- **returns**:
  - update function compatible with content expression

```typescript
svg`...`.css`path { color: ${value}; }`: Function
```

- **arguments**:
  - CSS content in tagged template literals
  - `value` - dynamic values concatenated with the template literal
- **returns**:
  - an update function compatible with content expression

```typescript
svg.resolve(promise: Promise, placeholder: Function, delay = 200): Function
```

- **arguments**:
  - `promise` - promise, which should resolve/reject update function
  - `placeholder` - update function for render content until promise is resolved or rejected
  - `delay` - delay in milliseconds, after which placeholder is rendered
- **returns**:
  - update function compatible with content expression

## Dispatch

```typescript
dispatch(host: Element, eventType: string, [options]): Boolean
```

- **arguments**:
  - `host` - element instance
  - `eventType` - type of the event to be dispatched
  - `options` - a dictionary, having the following optional fields:
    - `bubbles` - a boolean indicating whether the event bubbles. The default is false
    - `cancelable` - a boolean indicating whether the event can be cancelled. The default is false
    - `composed` - a boolean indicating whether the event will trigger listeners outside of a shadow root The default is false
    - `detail` - a custom data, which will be passed to an event listener
- **returns**:
  - `false` if event is cancelable and at least one of the event handlers which handled this event called `preventDefault()`, otherwise it returns `true`

## Store

### Direct

```typescript
store.get(Model: object, id?: string | object) : object;
```

- **arguments**:
  - `Model: object` - a model definition
  - `id: string | object` - a string or an object representing identifier of the model instance
- **returns**:
  - Model instance or model instance placeholder

```typescript
store.set(Model: object, values: object) : Promise;
```

- **arguments**:
  - `Model: object` - a model definition
  - `values: object` - an object with partial values of the model instance
- **returns**:
  - A promise, which resolves with the model instance

```typescript
store.set(modelInstance: object, values: object | null): Promise;
```

- **arguments**:
  - `modelInstance: object` - a model instance
  - `values: object | null` - an object with partial values of the model instance or `null` for deleting the model
- **returns**:
  - A promise, which resolves to the model instance or placeholder (for model deletion)

```typescript
store.sync(modelOrDefinition: object, values: object | null) : Model;
```

- **arguments**:
  - `modelOrDefinition` - a model instance or model definition
  - `values` - an object with partial values of the model instance or `null` for deleting the model
- **returns**:
  - Model instance or model instance placeholder

```typescript
store.clear(model: object, clearValue?: boolean = true)
```

- **arguments**:
  - `model` - a model definition (for all instances) or a model instance (for a specific one)
  - `clearValue` - indicates if the cached value should be deleted (`true`), or it should only notify the cache mechanism, that the value expired, but leaves the value untouched (`false`)

### Factory

```typescript
store(Model: object, options?: { id?: any | (host) => any, draft?: boolean }): object
```

- **arguments**:
  - `Model` - a model definition
  - `options` - an object with following options:
    - `id` - a `host` property name, or a function returning the identifier using the `host`
    - `draft` - a boolean switch for the draft mode, where the property returns a copy of the model instance for the form manipulation
- **returns**:
  - a hybrid property descriptor, which resolves to a store model instance

```typescript
store.submit(model: Model): Promise<Model>
```

- **arguments**:
  - `Model` - an instance of the draft model definition
- **returns**:
  - a promise resolving with the primary model instance

### Guards

```typescript
store.ready(model, ...): boolean
```

- **arguments**:
  - `model: object` - a model instance
- **returns**:
  - `true` for valid model instances, `false` otherwise

```typescript
store.pending(model, ...): boolean | Promise
```

- **arguments**:
  - `model: object` - a model instance
- **returns**:
  - In pending state a promise instance resolving with the next model value or a list of values, `false` otherwise

```typescript
store.error(model: Model, propertyName?: string | null): boolean | Error | any
```

- **arguments**:
  - `model` - a model instance
  - `propertyName` - a property name of the failed validation defined with `store.value()` method or `null` to return only general error message
- **returns**:
  - An error instance or whatever has been thrown, or `false`. When `propertyName` is set, it returns `err.errors[propertyName]` or `false`

### Ref

```typescript
store.ref(fn: () => Property): fn;
```

- **arguments**:
  - `fn` - a function returning the property definition
- **returns**:
  - Passed function specially marked, to use the result of the call instead of creating computed property

### Value

```typescript
store.value(defaultValue: string | number | boolean, validate?: fn | RegExp, errorMessage?: string): String | Number | Boolean
```

- **arguments**:
  - `defaultValue` - `string`, `number` or `boolean`
  - `validate` - a validation function - `validate(val, key, model)`, which should return `false`, error message or throws when validation fails, or a RegExp instance. If omitted, the default validation is used, which fails for empty string and `0`.
  - `errorMessage` - optional error message used when validation fails
- **returns**:
  - a `String`, `Number` or `Boolean` instance

### Resolve

```typescript
store.resolve(model: Model): Promise<Model>
```

- **arguments**:
  - `model` - a model instance
- **returns**:
  - A promise instance resolving with the latest model value or rejecting with an error

## Router

### Factory

```typescript
router(views: component | component[] | () => ..., options?: object): object
```

- **arguments**:
  - `views` - a defined component or an array of defined components. You can wrap `views` in a function to avoid using imports from uninitialized ES modules
  - `options` - an object with following options:
    - `url` - a string base URL used for views without own `url` option, defaults to current URL
    - `params` - an array of property names of the element, which are passed to every view as a parameter
- **returns**:
  - a hybrid property descriptor, which resolves to an array of elements

### Navigation

```typescript
router.url(view: component, params?: object): URL | ""
```

- **arguments**:
  - `view` - a component definition
  - `params` - an object with parameters to pass to the view
- **returns**:
  - an URL instance or an empty string

```typescript
router.backUrl(options?: { nested?: boolean, scrollToTop?: boolean }): URL | ""
```

- **arguments**:
  - `options` - an object with `nested` or `scrollToTop` options, both defaults to `false`
- **returns**:
  - an URL instance or an empty string

```typescript
router.currentUrl(params?: object): URL | ""
```

- **arguments**:
  - `params` - an object with parameters to pass to the view
- **returns**:
  - an URL instance or an empty string

```typescript
router.guardUrl(params?: object): URL | ""
```

- **arguments**:
  - `params` - an object with parameters to pass to the view
- **returns**:
  - an URL instance or an empty string

```typescript
router.resolve(event: Event, promise: Promise): Promise
```

- **arguments**:
  - `event` -`click` event from an anchor, or `submit` event from a form element
  - `promise` - a promise
- **returns**:
  - a chained promise from the arguments

```typescript
router.active(views: view | view[], options?: { stack?: boolean }): boolean
```

- **arguments**:
  - `views` - a view definition or an array of view definitions
  - `options` an optional object with `stack` boolean setting
- **returns**:
  - a boolean flag

### Debug

```typescript
router.debug(flag = true): void
```

- **arguments**:
  - `flag` - a boolean flag, defaults to `true`

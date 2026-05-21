# API Reference

The following functions are a public API of the hybrids library available as named exports:

## Definition

```typescript
define(component: object & { tag: string }): component;
```

- **arguments**:
  - `component` - an object with a map of hybrid property descriptors and a tag name set in the `tag` property
- **returns**:
  - `component` - the passed argument to the `define()` function

```typescript
define.from(components: object, options?: { prefix?: string; root?: string | string[]}): components;
```

- **arguments**:
  - `components` - an object map of components with tag names as keys (or paths to the files)
  - `options` - an optional object with settings
    - `prefix` - a prefix added to the tag names
    - `root` - a string or a list of strings, which are removed from the tag names
- **returns**:
  - `components` - the passed argument to the `define.from()` function

```typescript
define.compile(component: object): HTMLElement;
```

- **arguments**:
  - `component` - an object with a map of hybrid property descriptors without the `tag` property
- **returns**:
  - `HTMLElement` - a constructor for the custom element (not registered in the global custom elements registry)

```typescript
mount(target: HTMLElement, component: object): void;
```

- **arguments**:
  - `target` - a DOM element to attach the component definition to; usually it should be `document.body`
  - `component` - an object with a map of hybrid property descriptors without the `tag` property

## Parent

```typescript
parent(componentOrFn: Object | Function: (component, host) => {...}: Boolean): Object
```

- **arguments**:
  - `componentOrFn` - a reference to an object containing property descriptors, or a function that returns `true` when the current `component` meets the condition
- **returns**:
  - a property descriptor that resolves to `null` or an `Element` instance

## Children

```typescript
children(componentOrFn: Object | Function: (component, host) => {...}: Boolean, [options: Object]): Object
```

- **arguments**:
  - `componentOrFn` - a reference to an object containing property descriptors, or a function that returns `true` when the current `component` meets the condition
  - `options` - object with available keys:
    - `deep` - boolean, defaults to `false`
    - `nested` - boolean, defaults to `false`
- **returns**:
  - a property descriptor that resolves to an `array` of `Element` instances

## Templates

```typescript
html`<div property="${value}">${value}</div>` : Function
```

- **arguments**:
  - HTML content as the template content
  - `value` - dynamic values used as property values or element content
- **returns**:
  - an update function that takes `host` and `target` arguments

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
  - CSS content as tagged template literals
  - `value` - dynamic values concatenated with the template literal
- **returns**:
  - an update function compatible with the content expression

```typescript
html`...`.use(plugin: (fn: ((host, target) => void) => (host, target) => void): Function
```

- **arguments**:
  - `plugin` - a function that takes the original update function and returns a new update function
- **returns**:
  - an update function compatible with the content expression

```typescript
html.resolve(promise: Promise, placeholder: Function, delay = 200): Function
```

- **arguments**:
  - `promise` - a promise, which should resolve to the content expression value
  - `placeholder` - an update function that renders content until the promise is resolved or rejected
  - `delay` - delay in milliseconds after which the placeholder is rendered
- **returns**:
  - an update function compatible with the content expression

```typescript
html.set(propertyName: string, value?: any): Function
```

- **arguments**:
  - `propertyName` - the target host property name
  - `value` - a custom value, which will be set instead of `event.target.value`
- **returns**:
  - a callback function compatible with the template engine's event listener

```typescript
svg`<circle property="${value}">${value}</circle>` : Function
```

- **arguments**:
  - SVG content as the template content
  - `value` - dynamic values used as property values or element content
- **returns**:
  - an update function that takes `host` and `target` arguments

```typescript
svg`...`.style(styles: string, [styles: string]...): Function
```

- **arguments**:
  - `styles` - text content of CSS stylesheets
- **returns**:
  - an update function compatible with the content expression

```typescript
svg`...`.css`path { color: ${value}; }`: Function
```

- **arguments**:
  - CSS content as tagged template literals
  - `value` - dynamic values concatenated with the template literal
- **returns**:
  - an update function compatible with the content expression

```typescript
svg`...`.use(plugin: (fn: ((host, target) => void) => (host, target) => void): Function
```

- **arguments**:
  - `plugin` - a function that takes the original update function and returns a new update function
- **returns**:
  - an update function compatible with the content expression

## Dispatch

```typescript
dispatch(host: Element, eventType: string, [options]): Boolean
```

- **arguments**:
  - `host` - element instance
  - `eventType` - the type of the event to be dispatched
  - `options` - a dictionary with the following optional fields:
    - `bubbles` - a boolean indicating whether the event bubbles. Defaults to `false`
    - `cancelable` - a boolean indicating whether the event can be canceled. Defaults to `false`
    - `composed` - a boolean indicating whether the event will trigger listeners outside of a shadow root. Defaults to `false`
    - `detail` - custom data, which will be passed to the event listener
- **returns**:
  - `false` if the event is cancelable and at least one of the event handlers that handled this event called `preventDefault()`; otherwise it returns `true`

## Store

### Direct

```typescript
store.get(Model: object, id?: string | object) : object;
```

- **arguments**:
  - `Model: object` - a model definition
  - `id: string | object` - a string or an object representing the identifier of the model instance
- **returns**:
  - a model instance or model instance placeholder

```typescript
store.set(Model: object, values: object) : Promise;
```

- **arguments**:
  - `Model: object` - a model definition
  - `values: object` - an object with partial values of the model instance
- **returns**:
  - a promise that resolves with the model instance

```typescript
store.set(modelInstance: object, values: object | null): Promise;
```

- **arguments**:
  - `modelInstance: object` - a model instance
  - `values: object | null` - an object with partial values of the model instance, or `null` to delete the model
- **returns**:
  - a promise that resolves to the model instance or placeholder (for model deletion)

```typescript
store.resolve(model: Model): Promise<Model>
```

- **arguments**:
  - `model` - a model instance
- **returns**:
  - a promise instance that resolves with the latest model value or rejects with an error

```typescript
store.resolve(Model: object, id?: string | object): Promise<Model>
```

- **arguments**:
  - `Model` - a model definition
  - `id` - a string or an object representing the identifier of the model instance
- **returns**:
  - a promise instance that resolves with the latest model value or rejects with an error

```typescript
store.sync(modelOrDefinition: object, values: object | null) : Model;
```

- **arguments**:
  - `modelOrDefinition` - a model instance or model definition
  - `values` - an object with partial values of the model instance, or `null` to delete the model
- **returns**:
  - a model instance or model instance placeholder

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
  - `options` - an object with the following options:
    - `id` - a `host` property name, or a function returning the identifier using the `host`
    - `draft` - a boolean switch for draft mode, where the property returns a copy of the model instance for form manipulation
- **returns**:
  - a hybrid property descriptor that resolves to a store model instance

```typescript
store.submit(model: Model): Promise<Model>
```

- **arguments**:
  - `Model` - an instance of the draft model definition
- **returns**:
  - a promise that resolves with the primary model instance

### Guards

```typescript
store.ready(model, ...): boolean
```

- **arguments**:
  - `model: object` - a model instance
- **returns**:
  - `true` for valid model instances; `false` otherwise

```typescript
store.pending(model, ...): boolean | Promise
```

- **arguments**:
  - `model: object` - a model instance
- **returns**:
  - In the pending state, a promise instance that resolves with the next model value or a list of values; `false` otherwise

```typescript
store.error(model: Model, propertyName?: string | null): boolean | Error | any
```

- **arguments**:
  - `model` - a model instance
  - `propertyName` - a property name of the failed validation defined with the `store.value()` method, or `null` to return only the general error message
- **returns**:
  - an error instance or whatever has been thrown, or `false`. When `propertyName` is set, it returns `err.errors[propertyName]` or `false`

### Ref

```typescript
store.ref(fn: () => Property): fn;
```

- **arguments**:
  - `fn` - a function returning the property definition
- **returns**:
  - the passed function, specially marked so that the result of the call is used instead of creating a computed property

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

## Router

### Factory

```typescript
router(views: component | component[] | () => ..., options?: object): object
```

- **arguments**:
  - `views` - a defined component or an array of defined components. You can wrap `views` in a function to avoid using imports from uninitialized ES modules
  - `options` - an object with the following options:
    - `url` - a string base URL used for views without their own `url` option; defaults to the current URL
    - `params` - an array of element property names, which are passed to every view as a parameter
- **returns**:
  - a hybrid property descriptor that resolves to an array of elements

### Navigation

```typescript
router.url(view: component, params?: object): URL | ""
```

- **arguments**:
  - `view` - a component definition
  - `params` - an object with parameters to pass to the view
- **returns**:
  - a URL instance or an empty string

```typescript
router.backUrl(options?: { nested?: boolean, scrollToTop?: boolean }): URL | ""
```

- **arguments**:
  - `options` - an object with `nested` or `scrollToTop` options; both default to `false`
- **returns**:
  - a URL instance or an empty string

```typescript
router.currentUrl(params?: object): URL | ""
```

- **arguments**:
  - `params` - an object with parameters to pass to the view
- **returns**:
  - a URL instance or an empty string

```typescript
router.guardUrl(params?: object): URL | ""
```

- **arguments**:
  - `params` - an object with parameters to pass to the view
- **returns**:
  - a URL instance or an empty string

```typescript
router.resolve(event: Event, promise: Promise): Promise
```

- **arguments**:
  - `event` - a `click` event from an anchor, or a `submit` event from a form element
  - `promise` - a promise
- **returns**:
  - a chained promise from the arguments

```typescript
router.active(views: view | view[], options?: { stack?: boolean }): boolean
```

- **arguments**:
  - `views` - a view definition or an array of view definitions
  - `options` - an optional object with a `stack` boolean setting
- **returns**:
  - a boolean flag

# Descriptors

The library provides `define` function, which under the hood calls Custom Element API (read more in [Definition](./definition.md) section). Because of that, the library has all control over the parameters of the custom element definition. It creates class wrapper constructor dynamically, applies properties on its prototype, and finally defines custom element using `customElements.define()` method.

The property definition is known as a *property descriptor*. The name came from the third argument of the `Object.defineProperty(obj, prop, descriptor)` method, which is used to set those properties on the `prototype` of the custom element constructor.

## Structure

The descriptor structure is similar to what `Object.defineProperty()` requires for getter/setter property:

```javascript
const MyElement = {
  propertyName: {
    get: (host, lastValue) => { ... },
    set: (host, value, lastValue) => { ... },
    connect: (host, key, invalidate) => {
      ...
      // disconnect
      return () => { ... };
    },
    observe: (host, value, lastValue) => { ... },
  },
};
```

However, there are a few differences. Instead of using function context (`this` keyword), the first argument of all methods is the instance of an element. It allows using arrow functions and destructuring function arguments.

The second most change is the cache mechanism, which controls and holds current property value. By the specs, getter/setter property requires an external variable for keeping the value. In the hybrids, cache covers that for you. Additionally, the library provides a mechanism for change detection and calls `observe` method, when the value of the property has changed (directly or when one of the dependency changes).

**Despite the [factories](factories.md) and [translation](translation.md) concepts, you can always define properties using descriptors**. The only requirement is that your definition has to be an object instance (instead of a function reference, an array instance or primitive value).

## Defaults

The library provides a default method for `get` or `set` if they are omitted in the definition. The fallback method returns last saved value for `get`, and saves passed value for `set`. If the `get` method is defined, the `set` method does not support fallback to default (it allows creating read-only property).

```javascript
const MyElement = {
  defined: {
    get: () => {...},
    set: () => {...},
  },
  readonly: {
    get: () => {...},
  },
  defaultGet: {
    // get: (host, value) => value,
    set: () => {...},
  },
  defaultsWithConnect: {
    // get: (host, value) => value,
    // set: (host, value) => value,
    connect: () => {...},
  },
  defaultsWithObserve: {
    // get: (host, value) => value,
    // set: (host, value) => value,
    observe: () => {...},
  },
}
```

## Methods

### get

```typescript
get: (host: Element, lastValue: any) => {
  // calculate current value
  const value = ...;

  // return it
  return value;
}
```

* **arguments**:
  * `host` - an element instance
  * `lastValue` - last cached value of the property
* **returns (required)**:
  * `nextValue` - a value of the current state of the property

It calculates the current property value. The returned value is cached by default. The cache mechanism works between properties defined by the library (even between different elements). If your `get` method does not use other properties, it won't be called again (the only way to update the value then is to assert new value or call `invalidate` from `connect` method).

Cache mechanism uses equality check to compare values (`nextValue !== lastValue`), so it enforces using immutable data, which is one of the ground rules of the library.

In the following example, the `get` method of the `name` property is called again if `firstName` or `lastName` has changed:

```javascript
const MyElement = {
  firstName: 'John',
  lastName: 'Smith',
  name: {
    get: ({ firstName, lastName }) => `${firstName} ${lastName}`,
  },
};

console.log(myElement.name); // calls 'get' and returns 'John Smith'
console.log(myElement.name); // Cache returns 'John Smith'
```

### set

```typescript
set: (host: Element, value: any, lastValue: any) => {
  // calculate next value
  const nextValue = ...;

  // return it
  return nextValue;
}
```

* **arguments**:
  * `host` - an element instance
  * `value` - a value passed to assertion (ex., `el.myProperty = 'new value'`)
  * `lastValue` - last cached value of the property
* **returns (required)**: 
  * `nextValue` - a value of the property, which replaces cached value

Every assertion of the property calls `set` method (like `myElement.property = 'new value'`). If returned `nextValue` is not equal to `lastValue`, cache of the property invalidates. However, `set` method does not trigger `get` method automatically. Only the next access to the property (like `const value = myElement.property`) calls `get` method. Then `get` takes `nextValue` from `set` as the `lastValue` argument, calculates `value` and returns it.

The following example shows the `power` property, which uses the default `get`, defines the `set` method, and calculates the power of the number passed to the property:

```javascript
const MyElement = {
  power: {
    set: (host, value) => value ** value,
  },
}

myElement.power = 10; // calls 'set' method and set cache to 100
console.log(myElement.power); // Cache returns 100
```

If your property value only depends on other properties from the component, you can omit the `set` method and use the cache mechanism for holding property value (use only the `get` method).

### connect

```typescript
connect: (host: Element, key: string, invalidate: Function) => {
  // attach event listeners, etc...
  cb = () => {...};
  host.addEventListener('transitionend', cb);

  // return disconnect callback
  return () => {
    // clean up listeners
    host.removeEventListener('transitionend', cb);
  }
}
```

* **arguments**:
  * `host` - an element instance
  * `key` - a property key name
  * `invalidate` - a callback function, which invalidates cached value
* **returns (not required):**
  * `disconnect` - a function (without arguments)

When you insert, remove or relocate an element in the DOM tree, `connect` or `disconnect` is called synchronously (in the `connectedCallback` and `disconnectedCallback` callbacks of the Custom Elements API).

You can use `connect` to attach event listeners, initialize property value (using `key` argument) and many more. To clean up subscriptions, return a `disconnect` function, where you can remove attached listeners and other things.

If the third party code is responsible for the property value, you can use `invalidate` callback to notify that value should be recalculated (within next access). For example, it can be used to connect to async web APIs or external libraries:

```javascript
import reduxStore from './store';

const MyElement = {
  name: {
    get: () => reduxStore.getState().name,
    connect: (host, key, invalidate) => reduxStore.subscribe(invalidate),
  },
};
```

👆 [Click and play with `redux` integration on ⚡StackBlitz](https://stackblitz.com/edit/hybrids-redux-counter?file=redux-counter.js)

In the above example, a cached value of `name` property invalidates if `reduxStore` changes. However, the `get` method is called if you access the property.

### observe

```typescript
observe: (host: Element, value: any, lastValue: any) => {
  // Do side-effects related to value change
  ...
}
```

* **arguments**:
  * `host` - an element instance
  * `value` - current value of the property
  * `lastValue` - last cached value of the property

When property cache invalidates (directly by the assertion or when one of the dependency invalidates) and `observe` method is set, the change detection mechanism adds the property to the internal queue. Within the next animation frame (using `requestAnimationFrame`) properties from the queue are checked if they have changed, and if they did, `observe` method of the property is called. It means, that `observe` method is asynchronous by default, and it is only called for properties, which value is different in the time of execution of the queue (in the `requestAnimationFrame` call).

The property is added to the queue (if `observe` is set) for the first time when an element instance is created (in the `constructor()` of the element). Property value defaults to `undefined`. The `observe` method will be called at the start only if your `get` method returns other value than `undefined`.

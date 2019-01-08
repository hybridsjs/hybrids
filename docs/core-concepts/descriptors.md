# Descriptors

The library provides own `define` function, which under the hood calls Custom Element API (read more in [Definition](./definition.md) section). Because of that, the library has all control over the parameters of the custom element definition. It creates class wrapper constructor dynamically, applies properties on its prototype, and finally defines custom element using `customElements.define()` method.

Property definitions are known as a *property descriptor*. The name came from the third argument of the `Object.defineProperty(obj, prop, descriptor)` method, which is used to set those properties on the `prototype` of the custom element constructor.

## Structure

The descriptor structure is similar to what `Object.defineProperty()` requires for getter/setter property:

```javascript
const MyElement = {
  propertyName: {
    get: (host, lastValue) => { ... },
    set: (host, value, lastValue) => { ... },
    connect: (host, key, invalidate) => {
      ...
      return () => { ... }; // disconnect
    },
  },
};
```

However, there are a few differences. Instead of using function context (`this` keyword), the first argument of all methods is the instance of an element. It allows using arrow functions and destructuring function arguments.

The second most change is the cache mechanism, which controls and holds current property value. By the specs, getter/setter property requires external variable for keeping the value. In the hybrids, cache covers that for you.

**Despite the [factories](factories.md) and [translation](translation.md) concepts, you can always define properties using descriptors**. The only requirement is that your definition has to include at least one of the `get`, `set` or `connect` methods. 

The library uses default `get` or `set` method if they are not defined. The fallback method returns last saved value for `get`, and saves passed value for `set`. If `get` method is defined, `set` method does not fallback to default. It allows creating read-only property.

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
  defaultGetAndSet: {
    // get: (host, value) => value,
    // set: (host, value) => value,
    connect: () => {...},
  },
}
```

In the above example `readonly` and `defaultGet` properties might have `connect` method but is not required. `defaultGetAndSet` applies only when `connect` method is defined.

### Get

```typescript
get: (host: Element, lastValue: any) => {
  // calculate next value
  const nextValue = ...;

  // return it
  return nextValue;
}
```

* **arguments**:
  * `host` - an element instance
  * `lastValue` - last cached value of the property
* **returns (required)**:
  * `nextValue` - a value of the current state of the property

`get` method calculates current property value. The returned value is cached by default. This method is called again only if other properties defined by the library used in the body of the function have changed. Cache mechanism uses equality check to compare values (`nextValue !== lastValue`), so it enforces using immutable data, which is one of the ground rules of the library.

In the following example `get` method of the `name` property is called again if `firstName` or `lastName` has changed:

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

### Set

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

Every assertion of the property calls `set` method (like `myElement.property = 'new value'`). Cache value is invalidated if returned `nextValue` is not equal to `lastValue`. Only if cache invalidates `get` method is called. 

However, `set` method doesn't call `get` immediately. The next access to the property calls `get` method, although `set` returned a new value. Then `get` method takes this value as the `lastValue` argument, calculates `nextValue` and returns new value.

The following example shows `power` property using the default `get`, and defined `set` method, which calculates the power of the number passed to the property:

```javascript
const MyElement = {
  power: {
    set: (host, value) => value ** value,
  },
}

myElement.power = 10; // calls 'set' method and set cache to 100
console.log(myElement.power); // Cache returns 100
```

If your property value only depends on other properties from the component, you can omit `set` method and use cache mechanism for holding property value (use only `get` method).

### Connect & Disconnect

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

You can use `connect` to attach event listeners, initialize property value (using `key` argument) and many more. To clean up subscriptions return a `disconnect` function, where you can remove attached listeners and other things.

## Change detection

```javascript
myElement.addEventListener('@invalidate', () => { ...});
```

When property cache value invalidates, change detection dispatches `@invalidate` custom event (composed and bubbling). You can listen to this event and observe changes in the element properties. It is dispatched implicit when you set new value by the assertion or explicit by calling `invalidate` in `connect` callback. The event type was chosen to avoid name collision with those created by the custom elements authors.

If the third party code is responsible for the property value, you can use `invalidate` callback to update it and trigger event dispatch. For example, it can be used to connect to async web APIs or external libraries:

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

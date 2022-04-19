# Storage

Every model definition is connected to the storage. By default, the model definition uses memory attached to the cache layer. You can define a custom storage by the `[store.connect]` property in the model definition. It can be synchronous (memory, localStorage, etc.), or asynchronous, like external APIs.

## Memory

The `[store.connect]` property is not defined.

### Singleton

For a singleton, the memory storage always returns an instance of the model. It initializes a new instance when the model is accessed for the first time. Also, deleting the model resets values to defaults rather than removes the model instance from the memory.

```javascript
const Globals = {
  someValue: 123,
};

// logs: 123
console.log(store.get(Globals).someValue);

// logs: true
console.log(store.get(Globals) === store.get(Globals));
```

When the model is deleted, within the next call the default values will be returned:

```javascript
store.set(Globals, null).then(() => {
  // logs: 123
  console.log(store.get(Globals).someValue);
})
```

### Enumerable

For the enumerables, the memory storage returns models, which were created by the client. It supports the list action, which returns all existing models. The storage `loose` option is turned on to invalidate the list state when one of the models updates.

```javascript
const Todo = {
  id: true,
  desc: "",
  checked: false,
};

// Logs an array with all of the instances of the Todo model in memory
console.log(store.get([Todo]));
```

## External

For using custom storage set the `[store.connect]` property in the model definition:

```javascript
const Model = {
  ...,
  [store.connect] : {
    get?: (id) => {...},
    set?: (id, values, keys) => {...},
    list?: (id) => {...},
    observe?: (id, model) => {...},
    cache?: boolean | number [ms] = true,
    offline?: boolean | number [ms] = false,
    loose?: boolean = false,
  },
};
```

All of the fields are optional, but at least the `get` or `list` method must be defined.

### get

```typescript
get: (id: string | object) => object | null | Promise<object | null>
```

* **arguments**:
  * `id` - `undefined`, a `string` or `object` model instance identifier
* **returns (required)**:
  * `null`, an `object` representing model values or a `promise` resolving to the values for the model

If the storage definition only contains `get` method, you can use shorter syntax using a function as a value of the `[store.connect]` property (it works similar to the [translation](../core-concepts/translation.md) feature of the property descriptor):

```javascript
const Model = {
  ...,
  // equals to { get: (id) => {...} }
  [store.connect] : (id) => {...},
};
```
  
### set

```typescript
set: (id: undefined | string | object, values: object | null, keys: [string]) => object | null | Promise<object | null>
```

* **arguments**:
  * `id` - `undefined`, a `string` or `object` model instance identifier
  * `values` - an object with new values combined with current model state or `null` for deleting or reset model instance
  * `keys` - a list of names of the updated properties
* **returns (required)**:
  * `null`, an `object` representing model values or a `promise` resolving to the values for the model

When the `set` method is omitted, the model definition becomes read-only, and it is not possible to update values. As the `store.set()` method supports partial values, the `keys` argument contains a list of actually updated properties (it might be helpful if the storage supports partial update).

The configuration does not provide a separate method for creating a new instance of the model definition. The `id` argument is set to `undefined` when a new model is created. However, the `values` still contain the `id` property generated on the client-side by the UUIDv4 generator.

```javascript
{
  set(id, values) {
    if (id === undefined) {
      return api.create(values);
    }

    return api.update(id, values);
  }
}
```

### list

```typescript
list: (id: undefined | string | object) => [object] | Promise<[object]>
```

* **arguments**:
  * `id` - `undefined`, a `string` or `object` model instance identifier
* **returns (required)**:
  * an `array` of model instances or a `promise` resolving to the `array` of models

Use `list` method for [listing](./model.md#listing-enumerables) enumerable model definition. The listing type creates its own cache space mapped by the `id`, respecting the `cache` setting of the storage. It supports passing string identifier or object record.

```javascript
const Movie = {
  id: true,
  title: "",
  ...,
  [store.connect] : {
    get: (id) => movieApi.get(id),
    list: ({ query, year }) => movieApi.search({ query, year }),
  },
};

define({
  tag: "movie-list",
  query: '',
  year: 2020,
  movies: store([Movie], (host) => ({ query: host.query, year: host.year })),
  render: ({ query, year, movies }) => html`
    <input value="${query}" oninput="${html.set("query")}" />
    <input type="number" value="${year}" oninput="${html.set("year")}" />
    <ul>
      ${store.ready(movies) && movies.map(movie => html`<li>...</li>`)}
    </ul>
  `,
});
```

In the above example, the `list` method uses the search feature of the API. Using the listing type, we can display a result page with movies filtered by query and year. However, the result of the listing mode cannot contain additional metadata. For such a case, create a separate definition with a nested array of models.

```javascript
import Movie from "./movie.js";

const MovieSearchResult = {
  items: [Movie],
  offset: 0,
  limit: 0,
  [store.connect] : {
    get: ({ query, year }) => movieApi.search({ query, year }),
  };
};
```

### observe

```typescript
observe: (id: string | object | undefined, model: object | null, lastModel: object | null) => void
```

Use `observe` method for invoking side effects related to the model changes, for example to notify third party code that model has changed. It is called synchronously at the end of the `get` and `set` actions, just before the model value is passed to the memory cache layer. If the model is set for the first time, the `lastModel` argument is `null`. Similarly, if the model is deleted, the `model` argument is null.

!> Do not call the `store.get()` or `store.set()` methods related to the model itself from the `observe` method, as it may lead to the endless loop and throw the stack overflow error.

```javascript
const Model = {
  id: true,
  value, 0,
  [store.connect]: {
    async get(id) {
      const { model } = await chrome.storage.local.get(["model"]);
      return model[id];
    },
    async set(id, values) {... },
    observe(id, model) {
      // send message to another context in web extension
      chrome.runtime.sendMessage({ type: "model-changed", id, model });
    }
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "model-changed") {
    store.clear(Model, false);
  }
});
```

### cache

```typescript
cache: boolean | number [ms] = true
```

The `cache` option sets the expiration time for the cached value of the model instance. By default, it is set to `true`, which makes the cache persistent. Then, the data source is called only once or again if the cache is invalidated manually (explained below).

If `cache` is set to a `number`, it represents a time to invalidation counted in milliseconds. Expired models are not automatically fetched, or deleted from the cache. Only the next call for the model after its expiration time fetches data from the source again.

For the high-frequency data, set the `cache` value to `false` or `0`. Then, each call for the model will fetch data from the store. Usually, the store is used inside of the component properties, so its value is cached also on the host property level. Updating other properties won't trigger fetching data again (use cache invalidation for manual update).

#### Invalidation

Both memory and external storage uses a global cache mechanism based on the model definition reference. Model instances are global, so the cache mechanism cannot automatically predict which instance is no longer required. Because of that, the store provides the `store.clear()` method for invalidating model instances by the model definition or specific instance of the model.

```typescript
store.clear(model: object, clearValue?: boolean = true)
```

* **arguments**:
  * `model` - a model definition (for all instances) or a model instance (for a specific one)
  * `clearValue` - indicates if the cached value should be deleted (`true`), or it should only notify the cache mechanism, that the value expired, but leaves the value untouched (`false`)

For example, it might be useful to set the `clearValue` to `false` for the case when you want to implement the refresh button. Then, the values stay in the cache, but the store will fetch the next version of the instance.

```javascript
import Email from "./email.js";

function refresh(host) {
  store.clear(host.emails, false);
}

define({
  tag: "my-element",
  emails: store([Email]),
  render: ({ emails }) => html`
    <button onclick="${refresh}">Refresh</button>

    ${store.ready(emails) && ...}
  `,
});
```

#### Garbage Collector

The `store.clear()` method works as a garbage collector for unused model instances. Those that are not a dependency of any component connected to the DOM will be deleted entirely from the cache registry (as they would never exist) protecting from the memory leaks. It means, that even if you set `clearValue` to `false`, those instances that are not currently attached to the components, will be permanently deleted when the `store.clear()` method is invoked.

### offline

```typescript
offline: boolean | number [ms] = false
```

The `offline` option allows creating a persistent cache layer for offline access. Once the model instance is fetched from the source, it is stored in the `localStorage` (and it is updated each time when the model changes). When the user visits the page next time and requires the same model instance, the offline cache layer is used to return the cached value while the main source is still fetched for the data.

If the main source fails (for example, due to network problems), the value from the offline cache is used. The model still respects the states, so in that case, it will be in an `error` and `ready` state at once. It might be useful also for online users, as the last valid state of the model is returned synchronously while the main source is still called.

The keys for storing model instances are automatically generated using the model definition structure. If the definition changes, the key changes as well. Nested models are stored inside of the parent instances if they don't set their own `offline` mode, or otherwise, they have their place in the storage, while the parent model keeps the id reference.

!> Keep in mind that in a rare case when different model definitions have an identical structure of properties, they will share the same key in the `localStorage` for the offline mode

#### Automatic Clearing

The offline cache uses a self-clearing strategy, which ensures that the cache is not growing indefinitely. If the `offline` option is set to `true`, it uses the default thirty days expiration time. You can also set the expiration time to any number of milliseconds. After the threshold, the obsolete model instances are deleted from the cache.

```typescript
offline: true
```

If the `offline` option is set to `true`, the cache is cleared only if the main source is available and returns values (updates the cache values). In that case, when the user is offline, the cache values stay and they are used even if the expiration time is reached.

> When the user is offline, he cannot receive updates of the model structures (the new JS code). Because of that, the cache and model definitions are in sync, and the offline cache provides the latest structure with existing values

```typescript
offline: 1000 * 60 * 5 // 5 minutes
```

If the option is set to a `number` (time in milliseconds), the cached value is only returned if the expiration time is not yet reached. Otherwise, it is removed from the `localStorage`.

Use `true` for models, which can be used for a long time, and even when they are out of date. On another hand, the explicit time in milliseconds guarantees that the value will be returned only in that time window, also when the main source is not available.

#### Manual Clearing

Besides the automatic clearing, you can manually remove offline cache values, for example when the user logs out and private data must be deleted. If the `offline` option is set, the `store.clear()` method also clears cache values saved in `localStorage` for the model instance or model definition (with `clearValue` option set to `true`). You can read more about how to use the method in the section above.

```typescript
import Session from "./Session";

// Clears memory and localStorage caches
store.clear(Session);
```

### loose

```typescript
loose: boolean = false
```

The `loose` option of the model only affects cache invalidation of the listing enumerable models (the `loose` option of the nested array in the model definition is still respected).

By default, it is set to `false`, so updating model instances will not change items' order or placement in the array. The typical use case to turn it on is when you have a paginated list, and updating or creating a model instance might affect the order or content of the list.

If the user does not have control over the model, it is recommended to keep that option off. You can avoid unnecessary calls to external storage when the list result does not depend on the model instance values.

## Observables

The storage methods are called only for the user interaction - when the model is got, or when a new value for the model instance is set. However, there might be a case, where your model instance is been updated outside of the user scope, for example by the server.

Using the `store.set()` method as a callback for the update will trigger the storage `set` method, which can lead to an endless loop of updates. Fortunately, the store provides a special `store.sync()` method, which does the trick. It only updates the memory cache synchronously of the model instance without calling any storage method from the `[store.connect]` configuration.

!> This method bypass the storage, so use it with caution, and only if you would use `store.get()` in another context. This method does not replace `store.set()`.

```typescript
store.sync(modelOrDefinition: object, values: object | null) : Model;
```

* **arguments**:
  * `modelOrDefinition` - a model instance or model definition
  * `values` - an object with partial values of the model instance or `null` for deleting the model
* **returns**:
  * Model instance or model instance placeholder

```javascript
const Model = {
  ...,
  [store.connect] : {
    get: (id) => myApi.get("/model", id),
    set: (id, values) => myApi.set("/model", id, values),
  },
};

define({
  tag: "my-element",
  model: store(Model),
  socket: (host) => {
    const socket = io();

    socket.on("model:update", (values) => {
      store.sync(host.model, values);
    });
  },
});
```

In the above example, even though the `Model` is connected to the external storage, when the websocket emits an event, the values of the model update without calling `[store.connect].set()`, as we expect. It is an update triggered by the server, so we don't want to send new values to the server again.

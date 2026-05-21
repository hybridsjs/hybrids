# Store Storage

Every model definition is connected to storage. By default, the model definition uses memory attached to the cache layer. You can define custom storage with the `[store.connect]` property in the model definition. It can be synchronous (memory, localStorage, etc.) or asynchronous, like external APIs.

## Memory

The `[store.connect]` property is not defined.

### Singleton

For a singleton, the memory storage always returns an instance of the model. It initializes a new instance when the model is accessed for the first time. Also, deleting the model resets values to defaults rather than removing the model instance from memory.

```javascript
const Globals = {
  someValue: 123,
};

// logs: 123
console.log(store.get(Globals).someValue);

// logs: true
console.log(store.get(Globals) === store.get(Globals));
```

When the model is deleted, the next call will return the default values:

```javascript
store.set(Globals, null).then(() => {
  // logs: 123
  console.log(store.get(Globals).someValue);
})
```

### Enumerable

For enumerables, the memory storage returns models that were created by the client. It supports the list action, which returns all existing models. The storage `loose` option is turned on to invalidate the list state when one of the models updates.

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

To use custom storage, set the `[store.connect]` property in the model definition:

```javascript
const Model = {
  ...,
  [store.connect] : {
    get?: (id) => {...},
    set?: (id, values, keys) => {...},
    list?: (id) => {...},
    observe?: (id, model, lastModel) => {...},
    cache?: boolean | number [ms] = true,
    offline?: boolean | number [ms] = false,
    loose?: boolean = false,
  },
};
```

All fields are optional, but at least the `get` or `list` method must be defined.

### get

```typescript
get: (id: string | object) => object | null | Promise<object | null>
```

* **arguments**:
  * `id` - `undefined`, a `string` or `object` model instance identifier
* **returns (required)**:
  * `null`, an `object` representing model values or a `promise` resolving to the values for the model

If the storage definition only contains a `get` method, you can use a shorter syntax by using a function as the value of the `[store.connect]` property (it works similarly to the [translation](../component-model/structure.md#translation) feature of the property descriptor):

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
  * `values` - an object with new values combined with the current model state, or `null` to delete or reset the model instance
  * `keys` - a list of names of the updated properties
* **returns (required)**:
  * `null`, an `object` representing model values or a `promise` resolving to the values for the model

When the `set` method is omitted, the model definition becomes read-only and it is not possible to update values. As the `store.set()` method supports partial values, the `keys` argument contains a list of the actually updated properties (this might be helpful if the storage supports partial updates).

The configuration does not provide a separate method for creating a new instance of the model definition. The `id` argument is set to `undefined` when a new model is created. However, `values` still contains the `id` property generated on the client side by the UUIDv4 generator.

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

Use the `list` method for [listing](./model.md#listing-enumerables) enumerable model definitions. The listing type creates its own cache space mapped by `id`, respecting the `cache` setting of the storage. It supports passing a string identifier or object record.

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

In the above example, the `list` method uses the API's search feature. Using the listing type, we can display a result page with movies filtered by query and year. However, the result of the listing mode cannot contain additional metadata. For such a case, create a separate definition with a nested array of models.

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

* **arguments**:
  * `id` - `undefined`, a `string` or `object` model instance identifier
  * `model` - an `object` or `null` if the model is deleted
  * `lastModel` - an `object` or `null` if the model is set for the first time

Use the `observe` method for invoking side effects related to model changes, for example to notify third-party code that the model has changed. It is called synchronously at the end of the `get` and `set` actions, just before the model value is passed to the memory cache layer. If the model is set for the first time, the `lastModel` argument is `null`. Similarly, if the model is deleted, the `model` argument is `null`.

!> Do not call the `store.get()` or `store.set()` methods related to the model itself from the `observe` method, as it may lead to an endless loop and throw a stack overflow error.

```javascript
const Model = {
  id: true,
  value: 0,
  [store.connect]: {
    async get(id) {
      const { model } = await chrome.storage.local.get(["model"]);
      return model[id];
    },
    async set(id, values) { ... },
    observe(id, model, lastModel) {
      // send message to another context in the web extension
      chrome.runtime.sendMessage({ type: "model-changed", id, model, lastModel });
    },
  },
};

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

The `cache` option sets the expiration time for the cached value of the model instance. By default, it is set to `true`, which makes the cache persistent. Then, the data source is called only once, or again if the cache is invalidated manually (explained below).

If `cache` is set to a `number`, it represents the time to invalidation counted in milliseconds. Expired models are not automatically fetched or deleted from the cache. Only the next call for the model after its expiration time fetches data from the source again.

For high-frequency data, set the `cache` value to `false` or `0`. Then, each call for the model will fetch data from the store. Usually the store is used inside component properties, so its value is also cached at the host property level. Updating other properties won't trigger fetching data again (use cache invalidation for a manual update).

### offline

```typescript
offline: boolean | number [ms] = false
```

The `offline` option provides a persistent cache layer for offline access. Once the model instance is fetched from the source, it is stored in `localStorage` (and is updated each time the model changes). When the user visits the page next time and requests the same model instance, the offline cache layer is used to return the cached value while the main source is still being fetched.

If the main source fails (for example, due to network problems), the value from the offline cache is used. The model still respects the states, so in that case it will be in both an `error` and `ready` state at once. It might also be useful for online users, as the last valid state of the model is returned synchronously while the main source is still being called.

The keys for storing model instances are automatically generated using the model definition structure. If the definition changes, the key changes as well. Nested models are stored inside the parent instances if they don't set their own `offline` mode; otherwise, they have their own place in storage, while the parent model keeps an id reference.

!> Keep in mind that in the rare case where different model definitions have an identical property structure, they will share the same key in `localStorage` for the offline mode.

#### Automatic Clearing

The offline cache uses a self-clearing strategy that ensures the cache does not grow indefinitely. If the `offline` option is set to `true`, it uses a default thirty-day expiration time. You can also set the expiration time to any number of milliseconds. After the threshold, obsolete model instances are deleted from the cache.

```typescript
offline: true
```

If the `offline` option is set to `true`, the cache is cleared only when the main source is available and returns values (updating the cache values). In that case, when the user is offline, the cache values stay and are used even if the expiration time is reached.

> When the user is offline, they cannot receive updates to the model structures (the new JS code). Because of that, the cache and model definitions are in sync, and the offline cache provides the latest structure with existing values.

```typescript
offline: 1000 * 60 * 5 // 5 minutes
```

If the option is set to a `number` (time in milliseconds), the cached value is only returned if the expiration time has not yet been reached. Otherwise, it is removed from `localStorage`.

Use `true` for models that can be used for a long time, even when out of date. On the other hand, an explicit time in milliseconds guarantees that the value will only be returned within that time window, even when the main source is not available.

#### Manual Clearing

Besides the automatic clearing, you can manually remove offline cache values, for example when the user logs out and private data must be deleted. If the `offline` option is set, the `store.clear()` method also clears cache values saved in `localStorage` for the model instance or model definition (with the `clearValue` option set to `true`). You can read more about how to use the method in the section above.

```typescript
import Session from "./Session";

// Clears memory and localStorage caches
store.clear(Session);
```

### loose

```typescript
loose: boolean = false
```

The model's `loose` option only affects cache invalidation of listing enumerable models (the `loose` option of the nested array in the model definition is still respected).

By default, it is set to `false`, so updating model instances will not change the order or placement of items in the array. The typical use case for turning it on is when you have a paginated list, and updating or creating a model instance might affect the order or content of the list.

If the user does not have control over the model, it is recommended to keep this option off. You can avoid unnecessary calls to external storage when the list result does not depend on the model instance values.

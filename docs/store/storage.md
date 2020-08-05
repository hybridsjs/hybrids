# Storage

A model definition is connected to the data source with the cache mechanism attached to it. By default, the model definition uses memory storage attached to the persistent cache. You can define custom storage by the `[store.connect]` property in the model definition. The storage can synchronous (memory, localStorage, etc.), as well as asynchronous , like external APIs.

## Memory

The `[store.connect]` not defined.

### Singleton

For the singleton model definition, the store always returns an instance of the model. It means that the model does not have to be initialized before the first usage.

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

For the enumerable model definition, the memory storage supports listing with all of the model instances. However, it does not support passing `string` or `object` id (it always returns all of the instances).

```javascript
const Todo = {
  id: true,
  desc: "",
  checked: false,
};

// Logs an array with all of the instances of the Todo model
console.log(store.get([Todo]));
```

## External

Set the `[store.connect]` property in the model definition:

```javascript
const Model = {
  ...,
  [store.connect] : {
    get: (id) => {...},
    set?: (id, values, keys) => {...},
    list?: (id) => {...},
    cache?: boolean | number [ms] = true,
  },
};
```

### get

```typescript
get: (id: string | object) => object | null | Promise<object | null>
```

* **arguments**:
  * `id` - `undefined`, a `string` or `object` model instance identifier
* **returns (required)**:
  * `null`, an `object` representing model values or a `promise` resolving to the values for the model

If the storage definition only contains `get` method, you can use shorter syntax using a function as a value of the `[store.connect]` property (it works similar to the property descriptor):

```javascript
const Model = {
  ...,
  // equals to { get: (id) => {...} }
  [store.connect]: (id) => {...},
};
```
  
### set

```typescript
set?: (id: undefined | string | object, values: object, keys: [string]) => object | null | Promise<object | null>
```

* **arguments**:
  * `id` - `undefined`, a `string` or `object` model instance identifier
  * `values` - a model draft with updated values
  * `keys` - a list of names of the updated properties
* **returns (required)**:
  * `null`, an `object` representing model values or a `promise` resolving to the values for the model

When `set` method is omitted, the model definition became read-only, and it is not possible to update values. As the `store.set()` method supports partial values, the `keys` argument contains a list of actually updated properties (it might be helpful if the source supports partial update).

The configuration does not provide a separate method for creating a new instance of the model definition, but the `id` field is then set to `undefined` (for singleton model definition it is always `undefined`). Still, the `values` contains the `id` property generated on the client-side.

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
list?: (id: undefined | string | object) => [object] | Promise<[object]>
```

* **arguments**:
  * `id` - `undefined`, a `string` or `object` model instance identifier
* **returns (required)**:
  * an `array` of model instances or a `promise` resolving to the `array` of models

Use `list` method to support the [listing type](./model-definition.md#listing-mode) of the enumerable model definition. The listing type creates its own cache space mapped by the `id`, respecting the `cache` setting of the model. You can support passing query parameters, string values, or skip the `id` and return all instances.

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

const MovieList = {
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
}
```

In the above example, the `list` method uses the search feature of the API. Using the listing type, we can display a result page with movies filtered by query and year. However, the result of the listing mode cannot contain additional metadata. For such a case, create a separate definition with a nested array of models.

```javascript
import Movie from "./movie.js";

const MovieSearchResult = {
  items: [Movie],
  offset: 0,
  limit: 0,
  [store.connect] : {
    get: ({ query, year}) => movieApi.search({ query, year }),
  };
};
```

### cache

```typescript
cache?: boolean | number [ms] = `true`
```

`cache` option sets the expiration time for the cached value of the model instance. By default, it is set to `true`, which makes the cache persistent. It means that the data source is called only once or if the cache is invalidated manually (explained below).

If `cache` is set to a `number`, it represents a time to invalidation counted in milliseconds. Expired models are not automatically fetched, or removed from the memory. Only the next call for the model after its expiration fetches data from the source again.

For the high-frequency data, set `cache` value to `false` or `0`. Then, each call for the model will fetch data from the store. Usually, the store is used inside of the component properties. In that case, its value is cached also on the host property level, so updating other properties won't trigger fetching the model again (use cache invalidation for manual update).

#### Invalidation

Models with memory or external storage use a global cache mechanism based on the model definition reference. Model instances are global, so the cache mechanism cannot automatically predict which instance is no longer required. Because of that, the store provides `store.clear()` method for invalidating all of the model instances by the model definition or specific instance of the model.

```typescript
store.clear(model: object, clearValue?: boolean = true)
```

* **arguments**:
  * `model` - a model definition (for all instances) or a model instance (for a specific one)
  * `clearValue` - indicates if the cached value should be deleted (`true`), or it should only notify the cache mechanism, that the value expired, but leaves the value untouched (`false`)

For example, it might be useful to set the `clearValue` to `false` for the case when you want to implement the refresh button. Then, the values stay in the cache, but the store will fetch the next version of the models.

```javascript
import Email from "./email.js";

function refresh() {
  store.clear([Email], false);
}

const MyElement = {
  emails: store([Email]),
  render: ({ emails }) => html`
    <button onclick="${refresh}">Refresh</button>

    ${store.ready(emails) && ...}
  `,
}
```

#### Garbage Collector

The `store.clear()` method also works as a garbage collector for unused model instances. Those that are not a dependency of any component property will be deleted entirely from the cache registry (as they would never exist) protecting from the memory leaks. It means, that even if you set `clearValue` to `false`, those instances that are not currently attached to the components, will be permanently deleted.

# Usage

```javascript
import { store } from "hybrids";
```

The store provides two ways to interact with the data - the `store()` factory and two methods for direct access: `store.get()` and `store.set()`. Usually, all you need is a factory, which covers most of the cases. Direct access might be required for more advanced structures. For example, it is straightforward to create a paginated view with a list of data with the factory. Still, for infinite scroll behavior, you should display data from all of the pages, so you should call `store.get()` directly inside of the property getter.

## Direct

Even though the factory might be used more often than the methods, its implementation is based on `store.get()` and `store.set()` methods. Because of that, it is important to understand how they work.

The most important are the following ground rules:

* `store.get()` always returns the current state of the model instance **synchronously**
* `store.set()` always updates model instance **asynchronously** using `Promise` API
* `store.get()` and `store.set()` always return an **object** (model instance, placeholder or promise instance)

Those unique principals unify access to async and sync sources. From the user perspective, it is irrelevant what kind of data source has the model. The store provides a placeholder type, which is returned if there is no previous value of the model instance (the model instance is not found, it is pending, or an error was returned). The placeholder protects access to its properties, so you won't use it by mistake (the guards help using the current state of the model instance properly).

### `store.get()`

```typescript
store.get(Model: object, id?: string | object) : object;
```

* **arguments**:
  * `Model: object` - a model definition
  * `id: string | object` - a string or an object representing identifier of the model instance
* **returns**:
  * Model instance or model instance placeholder

The store resolves data as soon as possible. If the model source is synchronous (memory-based or external sync source, like `localStorage`), the get method immediately returns an instance. Otherwise, depending on the cached value and validation, the placeholder might be returned instead. When the promise resolves, the next call to the store returns an instance. The cache mechanism takes care to notify the component that data has changed (if you need to use this method outside of the component definition, you can use `store.pending()` guard to access the returned promise).

```javascript
const GlobalState = {
  count: 0,
};

function incCount(host) {
  store.set(GlobalState, { count: host.count + 1 });
}

const MyElement = {
  count: () => store.get(GlobalState).count,
  render: ({ count }) => html`
    <button onclick=${incCount}>${count}</button>
  `,
}
```

The above example uses a singleton memory-based model, so the data is available instantly. The `count` property can be returned directly inside of the property definition. Even the `count` property of the host does not rely on other properties, the `render` property will be notified when the current value of the `GlobalState` changes (keep in mind that this approach creates a global state object, which is shared between all of the component instances).

### `store.set()`

The `store.set()` method can create a new instance of the model or update the existing model. According to the mode, the first argument should be a model definition or a model instance.

The set method uses Promise API regardless of the type of data source. The model values are never updated synchronously. However, the current state of the model instance is updated. After calling the set method the `store.pending()` guard will return a truthy value, up to when the promise is resolved.

#### Create

```typescript
store.set(Model: object, values: object) : Promise;
```

* **arguments**:
  * `Model: object` - a model definition
  * `values: object` - an object with partial values of the model instance
* **returns**:
  * A promise, which resolves with the model instance

```javascript
const Settings = {
  color: "white",
  mode: "lite",
  ...,
};

// Updates only the `mode` property
store.set(Settings, { mode: "full" }).then(settings => {
  console.log(settings); // logs { color: "white", mode: "full", ... }
});
```

The singleton model has only one model instance, so it is irrelevant if you call `store.set` method by the model definition, or the model instance - the effect will be the same. For example, in the above code snippet, `Settings` can have a previous state, but setting new value by the model definition updates the already existing model instance.

#### Update

```typescript
store.set(modelInstance: object, values: object | null): Promise;
```

* **arguments**:
  * `modelInstance: object` - a model instance
  * `values: object | null` - an object with partial values of the model instance or `null` for deleting the model
* **returns**:
  * A promise, which resolves to the model instance or placeholder (for model deletion)

The only valid argument for values besides an object instance is a `null` pointer. It should be used to delete the model instance. However, as the last ground principle states, the store always returns an object. If the model instance does not exist, the placeholder is returned in the error state (with an error attached).

```javascript
function handleDeleteUser(host) {
  const { someUser } = host;

  store.set(someUser, null).then(someUser => {
    // someUser is now a placeholder with attached error
    console.log(store.error(someError)); // Logs an error "Not Found ..."
  });
}
```

The `store.set` supports partial values to update the model only with changing values. If you use nested object structures, you can update them partially as well:

```javascript
store.set(myUser, { address: { street: "New Street" }});
```

The above action will update only the `myUser.address.street` value leaving the rest properties untouched (it will copy them from the last state of the model).

## Factory

The factory defines a property descriptor connected to the store depending on the model definition configuration.

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

### Writable

If the model definition storage supports set action, the defined property will be writable (by the `store.set()` method).

```javascript
function setDarkTheme(host, event) {
  // updates `theme` property of the user model instance
  host.user = { theme: "dark" };
}

const MyElement = {
  userId: "1",
  user: store(User, { id: "userId" }),
  render: ({ user }) => html`
    ...
    <button onclick="${setDarkTheme}">Use dark theme</button>
  `,
};
```

### Singleton

If the model definition is a singleton, the `id` field is irrelevant, so you can access the instance without using options.

```javascript
import { Settings } from "./models.js";

const MyElement = {
  settings: store(Settings),
  color: ({ settings }) => settings.darkTheme ? "white" : "black",
  ...
};
```

### Enumerable

For the enumerable model definition, the `id` must be set (except the draft mode), either by the property name or a function.

```javascript
import { User, SearchResult }  from "./models.js";

const MyElement = {
  // Id from the host property (can be changed)
  userId: "1",
  user: store(User, "userId"), // using shorter syntax, equals to { id: "userId" }


  // Id from the host properties
  order: "asc",
  query: "",
  searchResult: store(SearchResult, ({ order, query }) => {
    return { order, query };
  }),
};
```

#### The Last Value

The significant difference between using `store.get()` method directly and the factory for enumerable models is a unique behavior implemented for returning the last instance even though the identifier has changed. The get method always returns the data according to the passed arguments. However, The factory caches the last value of the property, so when the id changes, the property still returns the previous state until the next instance is ready.

```javascript
import { User } from "./models.js";

function setNextPage(host) {
  host.page += 1;
}

const MyElement = {
  page: 1,
  userList: store([User], "page"),
  render: ({ userList, page }) => html`
    <style>
      ul.pending { opacity: 0.5 }
    </style>

    <ul class="${{ pending: store.pending(userList) }}">
      ${store.ready(userList) && userList.map(user => html`
        <li>${user.firstName} ${user.lastName}</li>
      `.key(user.id))}
    </ul>

    <button onclick=${setNextPage}>Go to: ${page + 1}</button>
  `,
};
```

Let's assume that the above `UserList` model definition is enumerable, and the page property sets the id for the external storage. When the property gets new data from the store, it returns the last page with the current loading state (from the next value). You can avoid a situation when the user sees an empty screen with a loading indicator - the old data are displayed until the new page is ready to be displayed. However, you still have the option to hide data immediately - use `store.pending()` guard for it.

### Draft Mode

The draft mode is especially useful when working with forms. It creates a copy of the model instance or creates a new one in the memory based on the provided model definition. When all of the changes in the draft are finished, use the `store.submit(draft)` method to create or update the primary model instance. For the protection against memory leaks, copied model instances are deleted when web components are disconnected in the draft mode.

```javascript
import { User } from "./models.js";

function submit(host, event) {
  event.preventDefault();

  // Creates a real `User` model instance
  store.submit(host.user).then(() => {
    // Clears values in the form
    host.user = null;
  });
}

const CreateUserForm = {
  user: store(User, { draft: true }),
  render: ({ user }) => html`
    <form onsubmit="${submit}">
      <div class="${ error: store.error(user, "firstName") }">
        <input value="${user.firstName}" oninput="${html.set(user, "firstName")}">
      </div>

      <div class="${ error: store.error(user, "lastName") }">
        <input value="${user.lastName}" oninput="${html.set(user, "lastName")}">
      </div>
    </form>
  `,
}
```

Use `store.value()` in the definition to validate values, and the `html.set(model, propertyPath)` helper from the template engine to update values without custom side effects (read more about the `html.set` for the store in the [`Event Listeners`](../template-engine/event-listeners.md#form-elements) section of the template engine documentation).

```javascript
const MyInput = {
  model: null,
  name: "",
  error: ({ model }) => store.error(model, name),
  render: ({ model, name }) => html`
    <div class="${ hasError: error }">
      <input value="${model[name]}" oninput="${html.set(model, name)}" />
      ${error && html`<p class="error-message">${error}</p>`}
    </div>
  `,
}

const MyUserForm = {
  userId: "",
  user: store(User, { id: "userId", draft: true }),
  render: ({ user }) => html`
    <my-input model="${user}" name="firstName"></my-input>
    <my-input model="${user}" name="lastName"></my-input>

    <button onclick="${submit}>Save changes</button>
  `.define({ MyInput }),
}
```

## Guards

The store provides three methods, which indicate the current state of the model instance. The returning value of those methods can be used, for example, for conditional rendering in the template. The `pending` and `error` return additional information. The returning values are not exclusive, so there are situations when more than one of them returns a truthy value.

### Ready

```typescript
store.ready(model: object): boolean
```

* **arguments**:
  * `model: object` - a model instance
* **returns**:
  * `true` for a valid model instance, `false` otherwise

The ready guard protects access to the models for async storage before they are fetched for the first time. You can also use it with sync storage, but if you are aware of the connection type, you can omit the guard.

The guard returns `true` only for a valid model instance. If the model has changed, the previous state of the model is not valid anymore, so for that object, it will return `false`.

When the model instance is going to be updated (by setting a new value, or by cache invalidation), the store returns the last valid state of the model until a new version is ready. In that situation `store.ready()` still returns `true`. It is up to you if you want to display a dirty state or not by combining ready and pending guards. It works the same if the update fails (then `store.error()` will be truthy as well). In simple words, the `store.ready()` always return `true` if the model was resolved at least once.

```javascript
import { User } from "./models.js";

const MyElement = {
  userId: "1",
  user: store(User),
  render: ({ user }) => html`
    ${store.ready(user) && html`
      <p>${user.firstName} ${user.lastName}</p>
    `}

    ${store.ready(user) && !store.pending(user) && html`
      <!-- This is hidden when "userId" changes (until new user data is ready) -->
    `}
  `,
}
```

### Pending

```typescript
store.pending(model: object): boolean | Promise
```

* **arguments**:
  * `model: object` - a model instance
* **returns**:
  * In pending state a promise instance resolving with the next model value, `false` otherwise

The pending guard returns a promise when a model instance is being fetched for async storages, or set for async and sync storages (`store.set()` method always use Promise API - look at the ground rules at the beginning of the section). If the model instance is returned from the cache (it is in a stable state), the guard returns `false`.

The pending and ready guards can be truthy if the already resolved model instance is updated.

### Error

```typescript
store.error(model: object, propertyName?: string): boolean | Error | any
```

* **arguments**:
  * `model` - a model instance
  * `propertyName` - a property name of the failed validation defined with `store.value()` method
* **returns**:
  * An error instance or whatever has been thrown or `false`. When `propertyName` is set, it returns `err.errors[propertyName]` or `false`

The error guard returns the value, which was thrown for the storage actions, usually an `Error` instance.

#### Validation Errors

The error guard can be used for quick access to the validation errors of the property defined with the `store.value()` (look at the example in the [Draft Mode](#draft-mode) section).

```javascript
const User = {
  id: true,
  name: store.value("", /^[a-z]+$/),
};

const MyElement = {
  user: store(User, { draft: true }),
  render: ({ user }) => html`
    <input value="${user.name}" oninput="${html.set(user, "name")} />
    <div class="errors">
      ${store.error(user, "name")}
    </div>
  `,
};
```

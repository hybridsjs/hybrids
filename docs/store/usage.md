# Usage

The store factory provides global state management based on model definitions with support for external storage. Use the store to share the internal state between the components or create a container for the data from internal or external APIs.

The feature follows all of the concepts of the library, including an extremely declarative approach. To use the store, just define your model, and start using it. The same cache protects synchronization, so the state of the models is always up to date inside of the web components created by the library. The store also simplifies access to different sources of data. The communication with models is the same, regardless of the source - either from sync storage like memory or from the async APIs.

## Overview

You can interact with the store by the `store` factory and two direct methods: `store.get()` and `store.set()`.

Usually, all you need is the factory, which covers most of the cases. Direct access might be required for more advanced structures. For example, it is straightforward to create a paginated view with a list of data with the factory. Still, for infinite scroll behavior, you should display data from all of the pages, so you have to call `store.get()` directly inside of the property getter.

The `store` factory uses direct methods internally. Because of that, it is important to understand how they work. The most important are the following three ground rules:

* `store.get()` always returns the current state of the model instance **synchronously**
* `store.set()` always updates model instance **asynchronously** using `Promise` API
* `store.get()` and `store.set()` always returns an **object** (model instance, placeholder or promise instance)

Those unique principles unify access to async and sync sources. From the user perspective, it is irrelevant what kind of data source the model has. The store provides a placeholder type, which is returned if there is no previous value of the model instance (the model instance is not found, it is pending, or an error was returned). The placeholder protects access to its properties, so it can't be used by mistake (the guards help to use the current state of the model instance properly).

## Direct Methods

### Get

```typescript
store.get(Model: object, id?: string | object) : Model;
```

* **arguments**:
  * `Model` - a model definition
  * `id` - a string or an object representing identifier of the model instance
* **returns**:
  * Model instance or model instance placeholder

The `store.get` method always returns an object - model instance or a model placeholder. If the model source is synchronous (memory-based or external sync source, like `localStorage`), the get method immediately returns an instance. Otherwise, before the cache has an instance of the model, the placeholder is returned instead. When the promise resolves, the next call to the store returns an instance. The cache takes care to notify the component that data has changed (if you need to use this method outside of the component definition, you can use the `store.pending()` guard to access the returned promise).

```javascript
const GlobalState = {
  count: 0,
};

function incCount(host) {
  store.set(GlobalState, { count: host.count + 1 });
}

define({
  tag: "my-element",
  count: () => store.get(GlobalState).count,
  render: ({ count }) => html`
    <button onclick=${incCount}>${count}</button>
  `,
});
```

The above example uses a singleton memory-based model, so the data is available instantly. The `count` property can be returned directly inside of the host property definition. Even the `count` property of the host does not rely on other properties, the `render` property will be notified when the current value of the `GlobalState` changes (keep in mind that this approach creates a global state object, which is shared between all of the component instances).

### Set

The `store.set()` method can create a new instance or update an existing model. According to the mode, the first argument should be a model definition or a model instance.

The set method always returns a promise regardless of the type of data source. The model values are updated within the next microtask. However, the current state of the model instance will be updated instantly. After calling the set method the `store.pending()` guard will return a truthy value (a promise instance), up to when the promise is resolved.

#### Create

```typescript
store.set(Model: object, values: object) : Promise<Model>;
```

* **arguments**:
  * `Model` - a model definition
  * `values` - an object with partial values of the model instance
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

The singleton model has only one model instance, so it is irrelevant if you call the `store.set` method by the model definition, or the model instance - the effect will be the same. For example, in the above code snippet, `Settings` can have a previous state, but setting a new value by the model definition updates the already existing model instance.

#### Update

```typescript
store.set(modelInstance: Model, values: object | null): Promise<Model>;
```

* **arguments**:
  * `modelInstance` - a model instance
  * `values` - an object with partial values of the model instance or `null` for deleting the model
* **returns**:
  * A promise, which resolves to the model instance or placeholder (for model deletion)

The only valid argument for `values` is an object or a `null` pointer, which should be used to delete the model instance. However, as the last ground principle states, the store always returns an object. If the model instance does not exist, the placeholder is returned in the error state (with an error attached).

```javascript
function handleDeleteUser(host) {
  const { someUser } = host;

  store.set(someUser, null).then(someUser => {
    // someUser is now a placeholder with an error attached
    console.log(store.error(someError)); // Logs an error "Not Found ..."
  });
}
```

#### Partial Values

The `store.set` supports partial values for updating the model only with a subset of values. If your model has nested object structures, you can update them partially as well:

```javascript
store.set(myUser, { address: { street: "New Street" }});
```

The above action will update only the `myUser.address.street` value leaving the rest properties untouched (they will be copied from the last state of the model).

## Factory

The factory defines a property descriptor connected to the store depending on the model definition configuration.

```typescript
store(Model: object, options?: { id?: any | (host) => any, draft?: boolean }): object
```

* **arguments**:
  * `Model` - a model definition
  * `options` - an object with following options:
    * `id` - a `host` property name, or a function returning the identifier using the `host`
    * `draft` - a boolean switch for the draft mode, where the property returns a copy of the model instance for the form manipulation
* **returns**:
  * a hybrid property descriptor, which resolves to a store model instance

> Updating the state of the model instance is only possible by the `store.set()` method directly

### Singleton

If the model definition is a singleton, define the property without the `id` option:

```javascript
const Settings = {
  darkTheme: false,
};

function toggleDarkTheme(host) {
  store.set(Settings, { darkTheme: !host.settings.darkTheme });
}

define({
  tag: "my-element",
  settings: store(Settings),
  color: ({ settings }) => settings.darkTheme ? "white" : "black",
  render: () => html`
    <button onclick="${toggleDarkTheme}">Toggle dark theme</button>
  `
});
```

### Enumerables and Listings

For the enumerable or listing model definition, the property creates a read-only connection to the model instance:

#### Explicit Identifier

If the `id` option is set, it can be a property name or a function returning the identifier:

```javascript
import { User }  from "./models.js";

define({
  tag: "my-element",
  // Id from the host property (can be changed)
  userId: "1",
  user: store(User, { id: "userId" }),

  // Id from the host properties
  order: "asc",
  query: "",
  searchResult: store([User], { id: ({ order, query }) => ({ order, query }) }),
});
```

#### Without Identifier

If the `id` option is omitted, the model instance is set by the own property key:

```javascript
define({
  tag: "my-element",

  // Id not set - "user" attribute or assertion to host.user sets the model instance
  // like: `el.user = "1"`, or `el.user = userModel`;
  user: store(User),
});
```

In this case, the model instance can be set by the property assertion (passing the id, or a model instance), or by the corresponding static attribute value:

```javascript
// set id by the property
const el = document.createElement("my-element");
el.user = "2";

// set by model reference of the same model definition
const someUser = store.get(User, "3");
el.user = someUser;
 
// set id by the attribute value
html`<my-element user="1"></my-element>`;
```

#### Cache

The significant difference between using the `store.get()` method directly and the factory for properties, which set the `id` option is a unique behavior for returning the last resolved value when identifier changes. The get method always returns the data according to the current state of the model. However, if the `id` option is set for enumerable or listing definition, the factory caches the last value of the property, until the next value is ready. In the meantime, guards return a state of the next value. It means, that it returns the old value, but in the pending state, rather than an empty placeholder for the new value:

```javascript
import { User } from "./models.js";

function setNextPage(host) {
  host.page += 1;
}

define({
  tag: "my-element",
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
});
```

In the above example, when the `page` changes, the `userList` property still returns the last page with the pending state from the next instance. Because of that, you can avoid a situation when the user sees an empty screen with a loading indicator - the old data are displayed until the new one is ready to be displayed. However, you have an option to hide data immediately - use the `store.pending()` guard.

### Draft Mode

The draft mode provides a copy of the model instance or a new one with default values. The model definition used in draft mode is a memory-based version of the given model definition. The draft instance is deleted from the memory when the component disconnects.

This mode can be especially useful when working with forms. If you want to use the store to keep form values, which also supports validation, use draft mode. When all of the changes are done, use the `store.submit(draft)` method to create or update the primary model instance.

```typescript
store.submit(model: Model): Promise<Model>
```

* **arguments**:
  * `Model` - an instance of the draft model definition
* **returns**:
  * a promise resolving with the primary model instance

The `store.submit()` method takes values from the draft and creates or updates the primary model instance.

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
        <input defaultValue="${user.firstName}" oninput="${html.set(user, "firstName")}">
      </div>

      <div class="${ error: store.error(user, "lastName") }">
        <input defaultValue="${user.lastName}" oninput="${html.set(user, "lastName")}">
      </div>
    </form>
  `,
}
```

Combine `store.value()` in the definition for validation, and the `html.set(model, propertyPath)` helper from the template engine to update values without custom side effects (read more about the `html.set` for the store in the [`Event Listeners`](../template-engine/event-listeners.md#form-elements) section of the template engine documentation).

```javascript
define({
  tag: "my-input",
  model: null,
  name: "",
  error: ({ model }) => store.error(model, name),
  render: ({ model, name }) => html`
    <div class="${ hasError: error }">
      <input defaultValue="${model[name]}" oninput="${html.set(model, name)}" />
      ${error && html`<p class="error-message">${error}</p>`}
    </div>
  `,
});

define({
  tag: "my-user-form",
  userId: "",
  user: store(User, { id: "userId", draft: true }),
  render: ({ user }) => html`
    <my-input model="${user}" name="firstName"></my-input>
    <my-input model="${user}" name="lastName"></my-input>

    <button onclick="${submit}>Save changes</button>
  `.define({ MyInput }),
});
```

## Guards

The store provides three guard methods, which indicate the current state of the model instance. The returning value of those methods can be used for conditional rendering in the template. The `pending` and `error` also return additional information. The returning values are not exclusive, so there are situations when more than one guard returns a truthy value.

### `store.ready()`

```typescript
store.ready(model, ...): boolean
```

* **arguments**:
  * `model` - a model instance
* **returns**:
  * `true` for valid model instances, `false` otherwise

The ready guard protects access to the models with async storage before they are fetched for the first time. You can also use it with sync storage, but if you are aware of the connection type, you can omit the guard.

The function supports passing one or more model instances. The guard returns `true` only for all resolved model instances (`AND` condition). If one of the models has changed, the previous state of the model is not valid anymore, so for that object, it will return `false`.

When the model instance is going to be updated (by setting a new value, or by cache invalidation), the store returns the last valid state of the model until a new version is ready. In that situation `store.ready()` still returns `true`. It is up to you if you want to display a dirty state or not by combining ready and pending guards. It works the same if the update fails (then `store.error()` will be truthy as well). In simple words, the `store.ready()` always return `true` if the model was resolved at least once.

```javascript
import { User } from "./models.js";

define({
  tag: "my-element",
  userId: "1",
  user: store(User),
  render: ({ user }) => html`
    ${store.ready(user) && html`
      <p>${user.firstName} ${user.lastName}</p>
    `}

    ${store.ready(user) && !store.pending(user) && html`
      <p>Hide this message when new user is fetched</p>
    `}
  `,
});
```

### `store.pending()`

```typescript
store.pending(model, ...): boolean | Promise
```

* **arguments**:
  * `model` - a model instance
* **returns**:
  * In pending state a promise instance resolving with the next model value or a list of values, `false` otherwise

The function supports passing one or more model instances. It returns a promise when at least one of the model instances (`OR` condition) is being fetched from async storage, or when the instance is set (`store.set()` method always use Promise API). If the model instance is resolved (it is in a stable state), the guard returns `false`.

Both pending and ready guards can be truthy if the already resolved model instance is being updated.

### `store.resolve()`

You can use the `store.resolve()` method to simplify access to pending model instances, which can be updated at the moment. The function returns a promise resolving into the current model instance, regardless of the pending state. It also supports multiple chains of set methods, so the result will always be the latest instance.

```typescript
store.resolve(model: Model): Promise<Model>
```

* **arguments**:
  * `model` - a model instance
* **returns**:
  * A promise instance resolving with the latest model value or rejecting with an error

```javascript
const State = {
  value: ""
};

async function sendValue(host) {
  // state can be in pending state at the moment (updating by the change event)
  const state = await store.resolve(host.state);
  const res = await fetch("/my-endpoint", { method: "post", body: JSON.stringify(state) });

  // do something with the response
}

define({
  tag: "my-element",
  state: store(State),
  render: ({ state }) => html`
    <my-async-data-source onupdate="${html.set(state, "value")}"></my-async-data-source>
    <button onclick="${sendValue}">Send</button>
  `,
});
```

### `store.error()`

```typescript
store.error(model: Model, propertyName?: string | null): boolean | Error | any
```

* **arguments**:
  * `model` - a model instance
  * `propertyName` - a property name of the failed validation defined with `store.value()` method or `null` to return only general error message
* **returns**:
  * An error instance or whatever has been thrown, or `false`. When `propertyName` is set, it returns `err.errors[propertyName]` or `false`

The `error` guard returns a caught error when the model instance is in an error state. The error instance is created by the `store.validate()` method. The error instance is also thrown when the model instance is in an error state and the `store.error()` is called without `propertyName`.

Also, this method can be used for displaying validation errors from the asynchronous API. The only requirement is, that your API client must throw the error with the following structure:

```javascript
async function getFromApi() {
  ...
  
  const err = new Error("Validation error");

  err.errors = {
    name: "Name is required",
    email: "Email is required",
  };

  throw err;
}
```

#### Errors from Validation

The error guard can be used for access to the validation errors of the property defined with the `store.value()` (look at the example in the [Draft Mode](#draft-mode) section). Use the second argument to set the property name of the model:

```javascript
const User = {
  id: true,
  name: store.value("", /^[a-z]+$/),
};

define({
  tag: "my-element",
  user: store(User, { draft: true }),
  render: ({ user }) => html`
    <input value="${user.name}" oninput="${html.set(user, "name")} />
    <div class="errors">
      ${store.error(user, "name")}
    </div>
  `,
});
```

The Error instance is not required, but it can be helpful to display the general error message.

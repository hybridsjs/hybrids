# Model

The model definition is based on plain object with a JSON-like structure of default values for the instances. Each definition creates its own global space for the data. The store identifies the space by the reference to the definition, so no register step is required, which should be done programmatically. You just define the model structure, and start using it with the store.

The model can represents a singleton with only one instance, or it can have multiple instances with unique identifiers. Each instance of the model is immutable, so updating its state always produces a new version of the model. However, models can reference each other. The instance itself does not have to be updated if its related model changes - the immutable are only the bounds, not the values.

## Type

The store supports three types of the models:

* Singleton with only one instance
* Enumerables with multiple instances
* Listing enumerable models

Each type creates its own space for the cache in the memory.

### Singleton & Enumerables

```javascript
const Model = {
  id?: true,
  ...
}
```

The `id` property indicates if the model has multiple instances, or it is a singleton. The only valid value for the `id` field is `true`. Otherwise, it should not be defined at all. For example, you may need only one instance of the `Profile` model of the current logged in user, but it can reference an enumerable `User` model.

```javascript
const User = {
  id: true,
  firstName: "",
  lastName: "",
  ...,
};

const Profile = {
  user: User,
  isAdmin: false,
  ...,
};
```

The value for the identifier can be a `string`, or an `object` record (a map of primitive values, which is normalized and serialized to `string` representation). The object record allows identifying models by multiple parameters rather than on string id. For example, `SearchResult` model definition can be identified by `{ query: "", order: "asc", ... }` map of values.

```javascript
const result = store.get(SearchResult, { query: "some", order: "desc" });
```

By default, the store generates identifier for enumerable models by the UUIDv4 generator. It means that memory-based models have unique ids out of the box. The external storage can use client-side generated id or return own identifier.

```javascript
const Model = {
  id: true,
  value: "",
  ...,
};

store.set(Model, { value: "test" }).then(model => {
  // logs something like "f25720aa-d258-434e-8826-99ac809d89b4"
  console.log(model.id);
});
```

### Listing Enumerables

The model definition must be a plain object by the design. However, the store supports a special type, which returns an array with a list of model instances. This type is represented by the enumerable model wrapped in the array - `[Model]`. It creates own space for the data, and it can have multiple instances identified by a `string` or an `object` record just like other model definitions. For memory-based models it always returns all instances of the definition, but it can be also used for models with external storage where the result depends on `list` action (read more in [Storage](./storage.md) section).

Wrapped definition creates the reference, so the listing does not have to be defined before usage. It will always reference the same definition:

```javascript
store.get([Model]) === store.get([Model])
```

The listing type fits best for the models, which can be represented as an array (like memory-based models):

```javascript
import { store, html } from 'hybrids';

const Todo = {
  id: true,
  desc: '',
  checked: false,
};

const MyElement = {
  todoList: store([Todo]),
  render: ({ todoList }) => html`
    <ul>
      ${store.ready(todoList) && todoList.map(todo => html`
        <li>
          <input type="checkbox" checked="${todo.checked}" />
          <span>${todo.desc}</span>
        </li>
      `)}
    </ul>
  `,
};
```

The listing type respects `cache` and `loose` options of the storage. By default the `loose` option is turn on, which means that the user's change to the model instance will invalidate the cache, and the next call for the list will fetch data again (read more in [Storage](./storage.md) section).

#### Metadata

If the listing requires additional metadata (like pagination, offset, etc.), you should create a separate model definition with a nested array of required models. It's likely that you should set `loose` option for the relation to the base model, as a change of the model instance might invalidate order or appearance in the result list.

```javascript
const TodoList = {
  items: [Todo, { loose: true }],
  offset: 0,
  limit: 0,
  [store.connect]: { ... },
};
```

## Structure

The model definition allows subset of the JSON standard with minor changes. The model instance serializes to a form, which can be sent over the network without additional modification.

### Primitive Value

```javascript
const Model = {
  firstName: "",
  count: 0,
  checked: false,
  ...
};
```

The model definition supports primitive values of `string`, `number`, or `boolean` type. The default value defines the type of the property (it works similarly to the [transform feature](./property.md#transform) of the property factory). For example, for strings, it is the `String(value)`.

#### Validation

The store supports client-side validation for `string` and `number` primitive values, which is called for `store.set()` action. If it fails, the instance won't be updated, and error will be attached to the instance. The rejected `Error` instance contains `err.errors` object, where all of the validation errors are listed by the property names (you can read more about how to use it in the [Usage](./usage.md#draft-mode) section).

To set property with the validation use `store.value()` method instead of passing the default value directly:

```javascript
const Model = {
  firstName: store.value(""),
  count: store.value(0, (val) => val > 10, "Value must be bigger than 10"),
  ...,
};
```

```typescript
store.value(defaultValue: string | number, validate?: fn | RegExp, errorMessage?: string): String | Number
```

* **arguments**:
  * `defaultValue` - `string` or `number` value
  * `validate` - a validation function - `validate(val, key, model)`, which should return `false`, error message or throws when validation fails, or a RegExp instance. If omitted, the default validation is used, which fails for empty string and `0`.
  * `errorMessage` - optional error message used when validation fails
* **returns**:
  * a `String` or `Number` instance

### Computed Value

```javascript
const Model = {
  firstName: 'Great',
  lastName: 'name!',
  fullName: ({ firstName, lastName }) => `${firstName} ${lastName}`,
}

// Somewhere with the model instance...
console.log(model.fullName); // logs "Great name!"
```

The computed property is based on other properties from the model. Its value is only calculated when the property is accessed for the first time (the result value is permanently cached). The property is non-enumerable to prevent serializing its value to the storage (for example, `JSON.stringify()` won't use it).

### Nested Object

The model definition supports two types of nested objects. They might be internal, where the value is stored inside the model instance, or they can be external as model instances bound by the id (with separate memory space).

The nested object structure is similar to the external model definition. It can be used as a primary model definition as well. The store must have a way to distinguish if the definition's intention is an internal structure or an external model definition. You can find how the store chooses the right option below.

#### Object Instance (Internal)

```javascript
const Model = {
  internal: {
    value: 'test',
    number: 0,
    ...
  },
};
```

If the nested structure does not provide `id` property, and it is not connected to the storage (by the `[store.connect]`), the store assumes that this is the internal part of the parent model definition. As a result, the data will be attached to the model, and it is not shared with other instances. Each model instance will have its nested values. All the rules of the model definition apply, so nested objects can have their own deep nested structures, etc.

#### Model (External)

```javascript
const ModelWithId = {
  // Enumerable
  id: true,
  ...
};

const SingletonFromStorage = {
  ...
  // Connected to the external storage
  [store.connect] : { ... },
};

const Model = {
  externalWithId: ModelWithId,
  externalSingleton: SingletonFromStorage,
};
```

If the nested object is a model definition with `id` property or it is connected to the storage, the store creates a dynamic binding to the model instance. Instead of setting value in-place, the property is set as a getter, which calls the store for a model instance by the id (for singletons, the identifier is always set to `undefined`). Keep in mind that it is a one way relation. Only the parent model creates a connection to the nested model. The related model does not know about the connection out of the box - it has only properties defined in its definition.

The parent model storage can provide a model instance data or a valid identifier (object records are not supported for nested objects - they are interpreted as data source). Object data will update nested model instance. Otherwise, the identifier will be saved in the parent model. After all, calling that property will invoke the store to get a proper model instance by its definition. It means that you can create relations between storages, which don't share data. The store will take care to get the model instance for you.

To remove the relation, set the property to `null` or `undefined` (it only removes the relation, not the related model). In that case, the value of the nested external object will be set to `undefined`.

### Nested Array

The store supports nested arrays in a similar way to the nested objects described above. The first item of the array represents the type of structure - internal (primitives or object structures), or external reference to enumerable model definitions (by the `id` property). Updating the nested array must provide a new version of the array. You cannot change a single item from the array in-place.

#### Primitives or Nested Objects (Internal)

```javascript
const Model = {
  // Primitive
  permissions: ['user', 'admin'],
  // Nested objects
  images: [
    { url: 'https://example.com/large.png', size: 'large' },
    { url: 'https://example.com/medium.png', size: 'medium' },
  ],
};
```

If the first item of the array is a primitive or an internal object instance (according to the rules defined for nested objects), the array's content will be unique for each model instance. The default value of the nested array can have more items, which will be created using the first element's model definition.

#### Models (External)

```javascript
import OtherModel from './otherModel.js';

const Model = {
  items: [OtherModel],
};
```

If the first item of the array is an enumerable model definition, the property represents a list of external model instances mapped by their ids. The parent model's storage may provide a list of data for model instances or a list of identifiers. The update process and binding between models work the same as for a single external nested object.

### Self Reference & Import Cycles

The model definition is based on the plain object definition, so by the JavaScript constraints, it is not possible to create property, which is a model definition of itself, or use definition from another ES module, which depends on the source file. In those situations you can use `store.ref(fn)` method, which sets property to the result of passed function in time of the definition (when model definition is used for the first time).

```typescript
store.ref(fn: () => Property): fn;
```

* **arguments**:
  * `fn` - a function returning the property definition
* **returns**:
  * a marked passed function, to use the result of the call instead of creating computed property

```javascript
const Model = {
  id: true,
  value: "",
  model: store.ref(() => Model),
};
```

In the above example, the `Model` defines a connected list structure, where each instance can reference to the same definition.

### Cache Invalidation

By default, the store does not invalidate the cached value of the parent model instance when nested external model changes. Because of the nature of the binding between models, when the nested model updates its state, the change will be reflected without a need to update the parent model's state.

However, the list might be related to the current state of nested models. For example, the model definition representing a paginated structure ordered by name must update when one of the nested model changes. After the change, the result pages might have a different content. To support that case, you can pass a second object to the nested array definition with `loose` option:

```javascript
import { store } from 'hybrids';
import User from './user.js';

const UserList = {
  id: true,
  users: [User, { loose: true }],
  ...,
  [store.connect]: (params) => api.get('/users/search', params),
};

const pageOne = store.get(UserList, { page: 1, query: '' });

// Updates some user and invalidates cached value of the `pageOne` model instance
store.set(pageOne.users[0], { name: 'New name' });
```

To prevent an endless loop of fetching data, the cached value of the parent model instance only invalidates if the `store.set` method is used. Updating the state of the nested model definition by fetching new values with `store.get` action won't invalidate the parent model. Get action still respects the `cache` option of the parent storage. If you need a high rate of accuracy of the external data, you should set a very low value of the `cache` option in the storage, or even set it to `false`.

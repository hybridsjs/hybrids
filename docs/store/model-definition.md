# Model Definition

A store model definition is a plain object with a JSON-like structure, which provides default values for the model instances. The model definition creates its own global space for the data. The access to data is based on the reference to the definition, so there is no register step, which should be done programmatically. You just define the model structure, and use it with the store.

The model definition might be a singleton with only one instance, or it can represent multiple instances with unique identifiers. Each instance of the model definition is immutable, so updating its state always produces a new version of the model. However, models can reference each other. The instance itself does not have to be updated if its related model changes - the immutable is only bound between them, not the values.

## Type

```javascript
const Model = {
  id?: true,
  ...
}
```

The store supports three types of model definitions: singleton with only one instance, enumerables with multiple instances, and listing enumerable models. Each type creates its own space for the cache in the memory.

### Singleton & Eumerable

The `id` property is an indicator for the store if the model has multiple instances, or it is a singleton. The only valid value for the `id` field is `true`. Otherwise, it should not be defined at all. For example, you may need only one instance of the `Profile` model of the current logged in user, but it can reference an enumerable `User` model.

The value of the identifier can be a `string`, or an `object` record (a map of primitive values). The latter is helpful for model definitions, which depend on parameters rather than on string id. For example, `SearchResult` model definition can be identified by `{ query, order, ... }` map of values.

Model instances created on the client-side have unique string id by default using UUID v4 generator. The external storage can use client-side generated id or return its identifier when a new instance is created.

### Listing

The store supports a listing model definition based on the enumerable model wrapped in the array (`[Model]`). This type returns an array of model instances.  For convenience, a model definition from the array creates the reference, so the listing mode does not have to be defined before usage, as it will always reference the same definition.

```javascript
store.get([Model]) === store.get([Model])
```

Listing memory-based models will return all instances of the definition. Listing type can also be used for models with external storage (more information you can find in [Storage](./storage.md) section).

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
      `)
    </ul>
  `,
};
```

The listing type is the best for models, which can be represented as an array (like memory-based models). If the listing requires additional metadata (like pagination, offset, etc.), you should create a separate model definition with a nested array of models.

```javascript
const TodoList = {
  items: [Todo],
  offset: 0,
  limit: 0,
  [store.connect]: { ... },
};
```

The listing type respects the `cache` option of the model, but the `loose` option is always turned on (it is the same feature as explained in the cache invalidation section for nested array). It means that the user's change to any instance of the model will invalidate the cache, and the next call for the list will fetch data again.

## Structure

The model definition allows a subset of the JSON standard with minor changes. The model instance serializes to a string in form, which can be sent over the network without additional modification.

### Primitive Value

```javascript
const Model = {
  firstName: "",
  count: 0,
  checked: false,
  ...
};
```

The model definition supports primitive values of `string`, `number`, or `boolean` type. The default value defines the type of the property. It works similarly to the [transform feature](./property.md#transform) of the property factory. For example, for strings, it is the `String(value)`.

#### Validation

The store supports validation for `string` and `number` values. Use `store.value()` method instead of passing the default value directly:

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

The validation runs only for the `store.set()` method (it protects the values only when the user interacts with the data). The rejected `Error` instance contains `err.errors` object, where all of the validation errors are listed by the property names (you can read more about how to use it in the [`Usage`](./usage.md#draft-mode) section).

### Computed Value

```javascript
const Model = {
  firstName: 'Great',
  lastName: 'name!',
  // Model instance will have not enumerable property `fullName`
  fullName: ({ firstName, lastName }) => `${firstName} ${lastName}`,
}

// Somewhere with the model instance...
console.log(model.fullName); // logs "Great name!"
```

The computed property allows defining value based on other properties from the model. Its value is only calculated if the property is accessed for the first time. As the model instance is immutable, the result value is permanently cached. Also, as it results from other values of the model, the property is non-enumerable to prevent serializing its value to the storage (for example, `JSON.stringify()` won't use its value).

### Nested Object

The model definition supports two types of nested objects. They might be internal, where the value is stored inside the model instance, or they can be external as model instances bound by the id (with separate memory space).

The nested object structure is similar to the external model definition. It could be used as a primary model definition as well. The store must have a way to distinguish if the definition's intention is an internal structure or an external model definition. You can find how the store chooses the right option below.

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

#### Model Definition (External)

```javascript
const ModelWithId = {
  // It is enumerable
  id: true,
  ...
};

const SingletonFromStorage = {
  ...
  // It connects to the external storage
  [store.connect]: { ... },
};

const Model = {
  externalWithId: ModelWithId,
  externalSingleton: SingletonFromStorage,
};
```

If the nested object is a model definition with `id` property or it is connected to the storage, the store creates a dynamic binding to the global model instance. Instead of setting value in-place, the property is a getter, which calls the store for a model instance by the id (for singletons, the identifier is always set to `undefined`). The relation is only one way - its the parent model, which creates a connection to the nested model. The related model does not know about the connection automatically - it has only properties defined in its definition.

The value for that property fetched from the parent storage might be a model instance data (an object with values) or a valid identifier (object identifiers are not supported here, as they are used as a data source). If the parent's model storage contains full data of the related model, it is treated as the newest version of that model instance, and the values of the instance are replaced with the result. Otherwise, the store will use and save the returned identifier. After all, calling that property will invoke the store to get a proper model instance by its definition. It means that you can create relations between data even between separate storages. The store will take care to get the data for you.

To indicate no relation, set the property to `null` or `undefined`. In that case, the value of the nested external object will be set to `undefined`.

### Nested Array

The store supports nested arrays in a similar way to the nested objects described above. The first item of the array represents the type of structure - internal (primitives or object structures), or external reference to enumerable model definitions (by the `id` property). Updating the nested array must provide a new version of the array. You cannot change a single item from the array in-place.

#### Primitives or Nested Objects (Internal)

```javascript
const Model = {
  permissions: ['user', 'admin'],
  images: [
    { url: 'https://example.com/large.png', size: 'large' },
    { url: 'https://example.com/medium.png', size: 'medium' },
  ],
};
```

If the first item of the array is a primitive value or an internal object instance (according to the rules defined for nested objects), the array's content will be unique for each model instance. The default value of the nested array in that mode can have more items, which will be created using the first element's model definition.

#### Model Definitions (External)

```javascript
import OtherModel from './otherModel.js';

const Model = {
  items: [OtherModel],
};
```

If the first item of the array is an enumerable model definition, the property represents a list of external model instances mapped by their ids. The parent model's storage may provide a list of data for model instances or a list of identifiers. The update process and binding between models work the same as for a single nested object. 

### Cache Invalidation

By default, the store does not invalidate the cached value of the parent model instance when nested external models change. Because of the nature of the binding between models, when the nested model updates its state, it will be reflected without the parent model's update.

However, the list in the parent model might be related to the current state of nested models. For example, the model definition representing a paginated structure ordered by name must update when one of the nested model changes. After the change, the result pages might have a different order. To support that case, you can pass a second object to the nested array definition with `loose` option:

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

To prevent an endless loop of fetching data, the cached value of the parent model instance with a nested array with `loose` option set to `true` only invalidates if the `store.set` method is used. Updating the state of the nested model definition by fetching new values by `store.get` action won't invalidate the parent model. Get action still respects the `cache` option of the parent storage (it's infinite for the memory-based models). This feature only tracks changes made by the user. If you need a high rate of accuracy of the external data, you should set a very low value of the `cache` option in the storage, or even set it to `false`.

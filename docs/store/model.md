# Store Model

The model definition is based on a plain object with a JSON-like structure of default values for the instances. Each definition creates its own global space for the data. The store identifies the space by reference to the definition, so no register step is required, which should be done programmatically. You just define the model structure and start using it with the store.

The model can represent a singleton with only one instance, or it can have multiple instances with unique identifiers. Each instance of the model is immutable, so updating its state always produces a new version of the model. Also, models can reference each other. The instance itself does not have to be updated if its related model changes - the immutable is only the bound, not the value.

## Identifier

The store supports two types of model definitions:

* Singleton with only one instance
* Enumerables with multiple instances

Additionally, enumerable models can be listed rather than referenced by the identifier.

### Singleton

```javascript
const Model = {
  value: "",
  ...
};
```

The singleton model definition does not have the `id` property. It means that there is only one instance of the model in the store. The store always returns the same instance for the definition. 

### Enumerables

```javascript
const Model = {
  id: true,
  ...
}
```

For enumerable models, the `id` property must be set to `true`. It means that the model can have multiple instances with unique identifiers. The store returns an instance for each identifier. The identifier can be a `string`, or an `object` record (a map of primitive values, which is normalized and serialized to `string` representation).

The object record identifies models by multiple parameters rather than by string id. For example, `SearchResult` model definition can be identified by `{ query: "", order: "asc", ... }` map of values.


```javascript
const result = store.get(SearchResult, { query: "some", order: "desc" });
```

By default, the store generates an identifier for enumerable models by the UUIDv4 generator. It means that memory-based models have unique ids out of the box. The external storage can use client-side generated id or return own identifier.

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

The store supports listing enumerable models by wrapping its definition with the array instance. The listing always reference the same base model definition:

```javascript
store.get([Model]) === store.get([Model])
```

The listing creates its own space for the result arrays, and it can have multiple instances identified by a `string` or an `object` record just like other model definitions:

```js
const filteredModels = store.get([Model], { query: 'some' });
```

For memory-based models, it always returns all instances of the definition, but it can be also used for models with external storage where the result depends on the `list` action (read more in [Storage](./storage.md) section).

```javascript
import { define, store, html } from 'hybrids';

const Todo = {
  id: true,
  desc: '',
  checked: false,
};

define({
  tag: "my-element",
  todos: store([Todo]),
  render: ({ todos }) => html`
    <ul>
      ${store.ready(todos) && todos.map(todo => html`
        <li>
          <input type="checkbox" checked="${todo.checked}" />
          <span>${todo.desc}</span>
        </li>
      `)}
    </ul>
  `,
});
```

## Primitive Value

```javascript
const Model = {
  firstName: "",
  count: 0,
  checked: false,
  ...
};
```

The model definition supports primitive values of `string`, `number`, or `boolean` type. The default value defines the type of the property (it works similarly to the [transform feature](./property.md#transform) of the property factory). For example, for strings, it is the `String(value)`.

### Validation

The store provides client-side validation for supported primitive values, which is called within `store.set()` action. If it fails, the instance won't be updated, and an error will be attached to the instance. The rejected `Error` instance contains the `err.errors` object, where all of the validation errors are listed by the property names (you can read more about how to use it in the [Usage](./usage.md#draft-mode) section).

To set the property with the validation use the` store.value()` method instead of passing the default value directly:

```javascript
const Model = {
  firstName: store.value(""),
  count: store.value(0, (val) => val > 10, "Value must be bigger than 10"),
  termsAndConditions: store.value(false),
  ...,
};
```

```typescript
store.value(defaultValue: string | number | boolean, validate?: fn | RegExp, errorMessage?: string): String | Number | Boolean
```

* **arguments**:
  * `defaultValue` - `string`, `number` or `boolean`
  * `validate` - a validation function - `validate(val, key, model)`, which should return `false`, error message or throws when validation fails, or a RegExp instance. If omitted, the default validation is used, which fails for empty string and `0`.
  * `errorMessage` - optional error message used when validation fails
* **returns**:
  * a `String`, `Number` or `Boolean` instance

## Computed Value

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

## Nested Object

The model definition supports two types of nested objects. They might be internal, where the value is stored inside the model instance, or they can be external as model instances bound by the id (with separate memory space).

The nested object structure is similar to the external model definition. It can be used as a primary model definition as well. The store must have a way to distinguish if the definition's intention is an internal structure or an external model definition. You can find how the store chooses the right option below.

### Object Instance (Internal)

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

### Model (External)

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

If the nested object is a model definition with `id` property or it is connected to the storage, the store creates a dynamic binding to the model instance. Instead of setting value in-place, the property is set as a getter, which calls the store for a model instance by the id (for singletons, the identifier is always set to `undefined`). Keep in mind that it is a one-way relation. Only the parent model creates a connection to the nested model. The related model does not know about the connection out of the box - it has only properties defined in its definition.

The parent model storage can provide a model instance data or a valid identifier (object records are not supported for nested objects - they are interpreted as data sources). Object data will update the nested model instance. Otherwise, the identifier will be saved in the parent model. After all, calling that property will invoke the store to get a proper model instance by its definition. It means that you can create relations between storages, which don't share data. The store will take care to get the model instance for you.

To remove the relation, set the property to `null` or `undefined` (it only removes the relation, not the related model). In that case, the value of the nested external object will be set to `undefined`.

## Nested Array

The store supports nested arrays in a similar way to the nested objects described above. The first item of the array represents the type of structure - internal (primitives or object structures), or external reference to enumerable model definitions (by the `id` property). Updating the nested array must provide a new version of the array. You cannot change a single item from the array in place.

### Primitives or Nested Objects (Internal)

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

If the nested array must be empty as a default value, you can use primitive constructor as the first item of the array:

```javascript
const Model = {
  domains: [String],
  numbers: [Number],
}

store.get(Model); // { domains: [], numbers: [] }
```

### Models (External)

```javascript
import OtherModel from './otherModel.js';

const Model = {
  items: [OtherModel, { loose: false | true = false }],
};
```

If the first item of the array is an enumerable model definition, the property represents a list of external model instances mapped by their ids. The second item is the optional options object with the `loose` option.

The parent model's storage may provide a list of data for model instances or a list of identifiers. The update process and binding between models work the same as for a single external nested object.

## Record

For the structure with variable keys, use the `store.record()` method, which creates a record definition. The record is a map of all of the supported types of properties (including nested objects and arrays):

```typescript
store.record(value): object;
```

* **arguments**:
  * `value` - any supported property value
* **returns**:
  * an empty object representing the record definition

```javascript
const Settings = {
  ...,
  flags: store.record(false),
};
```

The record definition by default is an empty object. For example, to set individual keys of the record use the `store.set()` method:

```javascript
// Set the record value
store.set(Settings, { flags: { a: true, b: false } });

// Remove the record key
store.set(Settings, { flags: { a: null } });

// Reset the record completely
store.set(Settings, { flags: null });
```

## Self Reference & Import Cycles

The model definition is based on the plain object definition, so by the JavaScript constraints, it is not possible to create a property, which references the model itself, or use the definition from another ES module, which depends on the source file (there is an import cycle). In those situations, use the `store.ref()` method, which sets a property to the result of the passed function in time of the definition (when the model definition is used for the first time).

```typescript
store.ref(fn: () => value): fn;
```

* **arguments**:
  * `fn` - a function returning the property definition
* **returns**:
  * a passed function, which is called in time of the definition

```javascript
const Model = {
  id: true,
  value: "",
  // single reference
  model: store.ref(() => Model),
  // multiple references - wrap Model in the array inside of the function
  models: store.ref(() => [Model]),
};
```

## Cache Invalidation

By default, the store does not invalidate the cached value of the model instance when nested in the array external model changes. Because of the nature of the binding between models, when the nested model updates its state, the change will be reflected without a need to update the parent model's state.

However, the list value might be related to the current state of nested models. For example, the model definition representing a paginated structure ordered by name must update when one of the nested models changes. After the change, the result pages might have different content. To support that case, you can pass a second object to the nested array definition with the `loose` option:

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

To prevent an endless loop of fetching data, the cached value of the parent model instance only invalidates if the `store.set` method is used. Updating the state of the nested model definition by fetching new values with the `store.get` action won't invalidate the parent model. Get action still respects the `cache` option of the parent storage. If you need a high rate of accuracy of the external data, you should set a very low value of the `cache` option in the storage, or even set it to `false`.


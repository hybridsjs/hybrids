# Store Model

The model definition is based on a plain object with a JSON-like structure of default values for the instances. Each definition creates its own global space for the data. The store identifies the space by reference to the definition, so no registration step is required - you don't have to do anything programmatically. You just define the model structure and start using it with the store.

A model can represent a singleton with only one instance, or it can have multiple instances with unique identifiers. Each instance of the model is immutable, so updating its state always produces a new version of the model. Models can also reference each other. The instance itself does not have to be updated if its related model changes - only the binding is immutable, not the value.

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

For enumerable models, the `id` property must be set to `true`. This means that the model can have multiple instances with unique identifiers. The store returns an instance for each identifier. The identifier can be a `string` or an `object` record (a map of primitive values, which is normalized and serialized to its `string` representation).

The object record identifies models by multiple parameters rather than by string id. For example, a `SearchResult` model definition can be identified by a `{ query: "", order: "asc", ... }` map of values.

```javascript
const result = store.get(SearchResult, { query: "some", order: "desc" });
```

By default, the store generates an identifier for enumerable models using the UUIDv4 generator. This means that memory-based models have unique ids out of the box. External storage can use the client-generated id or return its own identifier.

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

The store supports listing enumerable models by wrapping their definition in an array. The listing always references the same base model definition:

```javascript
store.get([Model]) === store.get([Model])
```

The listing creates its own space for the result arrays, and can have multiple instances identified by a `string` or an `object` record, just like other model definitions:

```js
const filteredModels = store.get([Model], { query: 'some' });
```

For memory-based models, it always returns all instances of the definition, but it can also be used for models with external storage, where the result depends on the `list` action (read more in the [Storage](./storage.md) section).

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

The model definition supports primitive values of `string`, `number`, or `boolean` type. The default value defines the type of the property (it works similarly to the type-checking behavior of property descriptors). For example, for strings, it is `String(value)`.

### Validation

The store provides client-side validation for supported primitive values, which is called within the `store.set()` action. If it fails, the instance won't be updated, and an error will be attached to the instance. The rejected `Error` instance contains an `err.errors` object, where all of the validation errors are listed by property name (you can read more about how to use it in the [Usage](./usage.md#draft-mode) section).

To set the property with validation, use the `store.value()` method instead of passing the default value directly:

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

A computed property is based on other properties of the model. Its value is only calculated when the property is accessed for the first time (the resulting value is permanently cached). The property is non-enumerable to prevent serializing its value to the storage (for example, `JSON.stringify()` won't use it).

## Nested Object

The model definition supports two types of nested objects. They can be internal, where the value is stored inside the model instance, or they can be external model instances bound by id (with separate memory space).

A nested object structure is similar to an external model definition. It can be used as a primary model definition as well. The store must have a way to distinguish whether the definition's intention is an internal structure or an external model definition. You can find how the store chooses the right option below.

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

If the nested structure does not provide an `id` property and is not connected to storage (via `[store.connect]`), the store assumes that this is an internal part of the parent model definition. As a result, the data will be attached to the model and is not shared with other instances. Each model instance will have its own nested values. All the rules of the model definition apply, so nested objects can have their own deeply nested structures, etc.

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

If the nested object is a model definition with an `id` property or is connected to storage, the store creates a dynamic binding to the model instance. Instead of setting the value in place, the property is set as a getter that asks the store for a model instance by id (for singletons, the identifier is always set to `undefined`). Keep in mind that it is a one-way relation. Only the parent model creates a connection to the nested model. The related model does not know about the connection out of the box - it only has the properties defined in its own definition.

The parent model storage can provide model instance data or a valid identifier (object records are not supported for nested objects - they are interpreted as data sources). Object data will update the nested model instance. Otherwise, the identifier will be saved in the parent model. Then, accessing that property will invoke the store to get the proper model instance by its definition. It means that you can create relations between storages that don't share data; the store will take care of fetching the model instance for you.

To remove the relation, set the property to `null` or `undefined` (this only removes the relation, not the related model). In that case, the value of the nested external object will be set to `undefined`.

## Nested Array

The store supports nested arrays in a similar way to the nested objects described above. The first item of the array represents the type of structure - internal (primitives or object structures), or an external reference to an enumerable model definition (by the `id` property). Updating the nested array must provide a new version of the array. You cannot change a single item from the array in place.

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

If the nested array must be empty as a default value, you can use a primitive constructor as the first item of the array:

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

If the first item of the array is an enumerable model definition, the property represents a list of external model instances mapped by their ids. The second item is an optional options object with the `loose` option.

The parent model's storage may provide a list of data for the model instances or a list of identifiers. The update process and binding between models work the same way as for a single external nested object.

## Record

For a structure with variable keys, use the `store.record()` method, which creates a record definition. The record is a map containing any of the supported property types (including nested objects and arrays):

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

By default, the record definition is an empty object. For example, to set individual keys of the record, use the `store.set()` method:

```javascript
// Set the record value
store.set(Settings, { flags: { a: true, b: false } });

// Remove the record key
store.set(Settings, { flags: { a: null } });

// Reset the record completely
store.set(Settings, { flags: null });
```

## Self Reference & Import Cycles

The model definition is based on a plain object definition, so due to JavaScript constraints, it is not possible to create a property that references the model itself, or to use a definition from another ES module that depends on the source file (creating an import cycle). In those situations, use the `store.ref()` method, which sets a property to the result of the passed function at the time of definition (when the model definition is used for the first time).

```typescript
store.ref(fn: () => value): fn;
```

* **arguments**:
  * `fn` - a function returning the property definition
* **returns**:
  * the passed function, which is called at the time of definition

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

By default, the store does not invalidate the cached value of the model instance when an external model nested in the array changes. Because of the nature of the binding between models, when the nested model updates its state, the change will be reflected without needing to update the parent model's state.

However, the list value might depend on the current state of the nested models. For example, a model definition representing a paginated structure ordered by name must update when one of the nested models changes. After the change, the result pages might have different content. To support that case, you can pass a second object to the nested array definition with the `loose` option:

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

To prevent an endless loop of fetching data, the cached value of the parent model instance only invalidates if the `store.set` method is used. Updating the state of the nested model definition by fetching new values with the `store.get` action won't invalidate the parent model. The get action still respects the `cache` option of the parent storage. If you need a high level of accuracy for the external data, you should set a very low value of the `cache` option in the storage, or even set it to `false`.

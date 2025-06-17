export type Property<E, V> =
  | (V extends string | number | boolean | null | undefined ? V : never)
  | ((host: E & HTMLElement) => V)
  | ((host: E & HTMLElement, value: any) => V)
  | Descriptor<E, V>;

export interface Descriptor<E, V> {
  value:
  | V
  | ((host: E & HTMLElement) => V)
  | ((host: E & HTMLElement, value: any) => V);

  connect?(
    host: E & HTMLElement & { __property_key__: V },
    key: "__property_key__",
    invalidate: () => void,
  ): Function | void;
  observe?(host: E & HTMLElement, value: V, lastValue: V): void;
  reflect?: boolean | ((value: V) => string);
}

export interface UpdateFunction<E> {
  (host: E & HTMLElement, target?: ShadowRoot | Text | E): void;
}

export interface RenderFunction<E> {
  (host: E & HTMLElement): UpdateFunction<E>;
}

export interface RenderDescriptor<E> extends Descriptor<E, RenderFunction<E>> {
  value: RenderFunction<E>;
  reflect?: never;
  shadow?: boolean | ShadowRootInit;
}

export type ComponentBase = {
  tag: string;
  __router__connect__?: ViewOptions;
};

export type Component<E> = ComponentBase & {
  [property in Extract<
    keyof Omit<E, keyof HTMLElement>,
    string
  >]: property extends "render"
  ? RenderFunction<E> | RenderDescriptor<E>
  : Property<E, E[property]>;
} & {
  render?: RenderFunction<E> | RenderDescriptor<E>;
};

export interface HybridElement<E> {
  new(): E & HTMLElement;
  prototype: E & HTMLElement;
}

/* Define */

export function define<E>(component: Component<E>): typeof component;

export namespace define {
  function compile<E>(component: Component<E>): HybridElement<E>;

  function from(
    components: { [path: string]: Component<any> },
    options?: { prefix?: string; root?: string | string[] },
  ): void;
}

/* Mount */
export function mount<E>(
  target: HTMLElement,
  component: Component<E>,
): () => void;

/* Factories */

export function parent<E, V>(
  componentOrFn: Component<V> | ((component: Component<E>) => boolean),
): Descriptor<E, V>;

export function children<E, V>(
  componentOrFn: Component<V> | ((component: Component<E>) => boolean),
  options?: { deep?: boolean; nested?: boolean },
): Descriptor<E, V[]>;

/* Store */

/**
 * Extracts the element type from an array type.
 * @deprecated Use built-in array type utilities instead. This type will be removed in future versions.
 * @template T - Target type
 * @example
 * type Item = Unarray<string[]>;  // string
 * type Value = Unarray<number>;   // number
 */
export type Unarray<T> = T extends Array<infer U> ? U : T;

/**
 * Represents non-array object types.
 * @deprecated Use `StrictObject<T extends {}>` instead. This type will be removed in future versions.
 */
export type NonArrayObject = NonArray & object;

/**
 * Excludes constructor types (classes) by requiring absence of `new` and `prototype` properties.
 * @example
 * declare function create<T>(obj: NonConstructor & T): void;
 * create({ foo: 1 });      // OK
 * create(class {});        // Error - has constructor properties
 */
export type NonConstructor = { new?: never, prototype?: never };

/**
 * Excludes iterable types (like arrays) by requiring absence of `[Symbol.iterator]`.
 * @example
 * declare function acceptNonArray<T>(obj: NonArray & T): void;
 * acceptNonArray({});       // OK
 * acceptNonArray([]);       // Error - array is iterable
 */
export type NonArray = { [Symbol.iterator]?: never };

/**
 * Excludes function types by making the function signature return `never`.
 * @example
 * declare function acceptNonFunction<T>(obj: NonFunction & T): void;
 * acceptNonFunction(42);    // OK
 * acceptNonFunction(() => {}); // Error - function detected
 */
export type NonFunction = { (...args: any[]): never };

/**
 * Represents a strict non-array, non-constructor object type.
 * Acts as a type guard against unintended matches in complex type operations.
 * 
 * @template T - Base object type to extend
 * @example
 * // Prevents array/class/function from matching object type:
 * type Test1 = [1,2,3] extends StrictObject<{}> ? true : false;  // false
 * type Test2 = class {} extends StrictObject<{}> ? true : false;  // false
 */
export type StrictObject<T extends {}> = T & object & NonArray & NonConstructor

/**
 * Represents a function that cannot be used as a constructor.
 * @template T - Function type to enforce
 * @example
 * declare function wrapFunction<T>(fn: StrictFunction<T>): void;
 * wrapFunction(() => console.log("ok"));  // OK
 * wrapFunction(class {});                 // Error - constructor prohibited
 */
export type StrictFunction<T extends (...args: any) => any> = T & NonConstructor;

/**
 * Represents a class constructor that cannot be called as a plain function.
 * @template T - Instance type of the class
 * @example
 * declare function registerClass<T>(cls: StrictClass<T>): void;
 * registerClass(class Foo {});     // OK
 * registerFunction(function() {}); // Error - not a class
 */
export type StrictClass<T = any> = { new(...args: any[]): T; prototype: T; } & NonFunction;

/**
 * Marker type to exclude model definition objects.
 * Contains hidden system property that prevents accidental type matching.
 * 
 * @internal
 * @example
 * // Without NonModelDefinition, this would incorrectly return true:
 * type Test = ModelDefinition extends Model ? true : false; // false
 */
export type NonModelDefinition = { __store__connect__?: never };


/**
 * Base model type requiring plain objects with optional `id` property.
 * Combines multiple protective markers to prevent type misclassification:
 * 1. StrictObject - blocks arrays/classes
 * 2. NonModelDefinition - blocks model definitions
 * 
 * @example
 * // Critical for type discrimination in functions like:
 * function resolve<M extends Model>(input: M | ModelDefinition<M> | [ModelDefinition<M>]) {
 *   // Without protective markers:
 *   //   ModelDefinition would match Model
 *   //   ModelDefinition[] would match Model
 * }
 */
export type Model = StrictObject<{ id?: ModelIdentifier }> & NonModelDefinition;

/**
 * Model type requiring explicit identifier (`id` property required).
 * Inherits same protective markers as base Model.
 * 
 * @example
 * // Without StrictObject/NonModelDefinition:
 * type Problem1 = ModelDefinition extends EnumerableModel ? true : false; 
 * // Would be true (incorrect)
 */
export type EnumerableModel = StrictObject<{ id: ModelIdentifier }> & NonModelDefinition;

/**
 * Model type prohibiting identifier (`id` property forbidden).
 * Protective markers ensure only true singletons match.
 * 
 * @example
 * // Prevents array of definitions from matching:
 * type Test = [ModelDefinition] extends SingletonModel ? true : false; // false
 */
export type SingletonModel = StrictObject<{ id?: never }> & NonModelDefinition;

/**
 * Removes index signatures (string, number, and symbol) from object types.
 * 
 * Used to eliminate phantom keys that TypeScript automatically includes
 * when index signatures like `[key: string]: T` or `[key: number]: T` are present.
 *
 * #### The Problem
 * When an interface contains an index signature, TypeScript automatically
 * includes all possible keys in `keyof` (including `string` and `number`).
 * This interferes with key-specific mappings and causes unwanted iteration behavior.
 * 
 * #### The Solution
 * `StripIndex<T>` filters out generic `string`, `number`, and `symbol` keys
 * from `keyof T`, preserving only explicitly defined properties.
 * 
 * #### How It Works
 * Uses key remapping with conditional exclusion:
 * 1. For string keys: `key extends string ? (string extends key ? never : key)`
 * 2. For number keys: `key extends number ? (number extends key ? never : key)`
 * 3. For symbol keys: `key extends symbol ? (symbol extends key ? never : key)`
 * 
 * #### Example:
 * ```ts
 * type Raw = {
 *   id: string;
 *   name: string;
 *   [key: string]: unknown;  // Index signature
 * }
 * 
 * type Clean = StripIndex<Raw>;
 * // Result: {
 * //   id: string;
 * //   name: string
 * // } // No indexes!
 * ```
 * 
 * @template T Object type to remove index signatures from
 */
export type OmitIndexes<T extends object> = {
  [key in keyof T as
  key extends string ? (string extends key ? never : key) :
  key extends number ? (number extends key ? never : key) :
  key extends symbol ? (symbol extends key ? never : key) :
  key
  ]: T[key];
}

export type PickIndexes<T extends object> = {
  [key in keyof T as
  key extends string ? (string extends key ? key : never) :
  key extends number ? (number extends key ? key : never) :
  key extends symbol ? (symbol extends key ? key : never) :
  key
  ]: T[key]
} extends infer IndexPart ? [keyof IndexPart] extends [never] ? void : IndexPart : never;

type A = PickIndexes<{}>

/**
 * Defines the structure and behavior of a model in the system.
 * Maps each model property to either:
 * - Identity marker (for 'id' properties)
 * - Field definition
 * - Value resolver function
 * 
 * @template TModel - Model type being defined (must extend `Model`)
 * 
 * ### Structure
 * 1. **Property Mappings**:
 *    - Identity properties: Marked with `true`
 *    - Other properties: Field definitions or resolver functions
 * 2. **Storage Connector** (optional):
 *    - Connection to storage system (`store.connect`)
 * 
 * ### Key Features
 * - Removes index signatures via `StripIndex`
 * - Makes all properties required (`-?` modifier)
 * - Distinguishes identity properties via `IsIdentityProperty`
 * - Allows computed properties via `ValueResolver`
 * 
 * @example
 * ```tsx
 * const User: ModelDefinition<User> = {
 *   id: true,  // Identity property
 *   name: "",  // Default value (string field)
 *   email: {   // Field definition
 *     type: String,
 *     validate: emailValidator
 *   },
 *   fullName: (user) => `${user.first} ${user.last}`,  // Computed property
 *   [store.connect]: (id) => api.fetchUser(id)  // Storage connector
 * };
 * ```
 */
export type ModelDefinition<TModel extends Model> = {
  /**
   * Maps each model property to its definition:
   * - Identity properties → `true`
   * - Other properties → Field definition or resolver function
   * 
   * Uses `StripIndex` to remove index signatures and ensure only
   * explicit properties are considered
   */
  [key in keyof Omit<OmitIndexes<TModel>, "id">]-?:
    | (TModel[key] extends object ?
        PickIndexes<TModel[key]> extends { [key: string]: infer ItemType } ? Referable<StoreRecord<ItemType>> :
        PickIndexes<TModel[key]> extends { [key: number]: infer ItemType } ? Referable<StoreRecord<ItemType>> :
        PickIndexes<TModel[key]> extends { [key: symbol]: infer ItemType } ? Referable<StoreRecord<ItemType>> :
        Referable<FieldDefinition<TModel[key]>> :
      Referable<FieldDefinition<TModel[key]>>)
    | ValueResolver<TModel, TModel[key]>
} & EnumerableIndicator<TModel> & StorageConnector<TModel>


type EnumerableIndicator<TModel extends Model> = TModel extends EnumerableModel ? { id: true } : {}

/** 
 * Optional storage system connector
 * - Used with `store.connect` symbol in implementations
 * - Can be either:
 *   a) Full storage interface
 *   b) Storage's `get` method for fetching data
 */
type StorageConnector<TModel extends Model> = {
  __store__connect__?: Storage<TModel> | Storage<TModel>["get"];
}

type StoreRecord<TValue> = {
  __store__record__: TValue
}

/**
 * Determines if a property is the model's identity property.
 * 
 * - Must be named 'id'
 * - Must have a valid ModelIdentifier type
 * 
 * @template TKey - Property name
 * @template TValue - Property value type
 * 
 * @example
 * ```ts
 * type Test1 = IsIdentityProperty<'id', string>;  // true
 * type Test2 = IsIdentityProperty<'name', string>; // false
 * type Test3 = IsIdentityProperty<'id', boolean>; // false
 * ```
 */
export type IsIdentityProperty<TKey, TValue> = TKey extends "id" ? TValue extends ModelIdentifier ? true : false : false

/**
 * Represents possible types for model identifiers.
 * 
 * - Single string value
 * - Composite key (record of primitive values)
 * - Undefined (for singleton models)
 * 
 * @example
 * ```ts
 * type UserID = string;  // Simple identifier
 * type OrderID = { orderNo: string, region: string };  // Composite key
 * ```
 */
export type ModelIdentifier =
  | string
  | Record<string, string | boolean | number | null>
  | undefined;

/**
 * Special flag marking identity properties in model definitions.
 * Always set to `true` for 'id' fields.
 * 
 * @example
 * ```ts
 * const ProductModel = {
 *   id: true,  // IdentityFlag
 *   // ...
 * }
 * ```
 */
export type IdentityFlag = true

/**
 * Strict function type for computed property resolvers.
 * 
 * - Receives the model instance as input
 * - Returns computed value
 * - Prevents constructor usage
 * 
 * @template TModel - Model type
 * @template Value - Computed value type
 * 
 * @example
 * ```ts
 * const resolver: ValueResolver<User, string> = 
 *   (user) => `${user.firstName} ${user.lastName}`;
 * ```
 */
export type ValueResolver<TModel extends Model, Value> = StrictFunction<(model: TModel) => Value>

/**
 * Defines type mappings for model fields based on their data type.
 * Uses distributive conditional types to handle union types correctly.
 * 
 * #### Distributivity Importance
 * Without distributivity:
 * - Union types would fail (`string | number` wouldn't match either branch)
 * - Complex types wouldn't resolve correctly
 * 
 * @template FieldType - Type of the model field being defined
 * 
 * @example Array Handling
 * ```ts
 * // Array of strings:
 * type StringArrayDef = FieldDefinition<string[]>; // GuardedStringArray
 * 
 * // Array of models:
 * type ModelArrayDef = FieldDefinition<Product[]>; 
 * // GuardedModelArray<Product> | Ref<GuardedModelArray<Product>>
 * ```
 * 
 * @example Primitive Handling
 * ```ts
 * type StringDef = FieldDefinition<string>;      // GuardedString
 * type NumberDef = FieldDefinition<number>;      // GuardedNumber
 * type BooleanDef = FieldDefinition<boolean>;    // GuardedBoolean
 * ```
 */
export type FieldDefinition<FieldType> =
  // ARRAY (distributive check)
  FieldType extends Array<infer ItemType> ?
    ItemType extends string | String ? GuardedStringArray :
    ItemType extends number | Number ? GuardedNumberArray :
    ItemType extends boolean | Boolean ? GuardedBooleanArray :
    ItemType extends Model ? GuardedModelArray<ItemType> :
    ItemType extends EnumerableModel ? GuardedEnumerableModelArray<ItemType> :
    never :
  // REGULAR (distributive check)
  FieldType extends string | String ? GuardedString :
  FieldType extends number | Number ? GuardedNumber :
  FieldType extends boolean | Boolean ? GuardedBoolean :
  FieldType extends Model ? GuardedModel<FieldType> :
  never;

/** 
 * Reference wrapper type for lazy evaluation.
 * Allows defining values as functions: `() => T`
 */
export type Reference<T> = () => T

export type Referable<T> = T | Reference<T>

/** Primitive string type for field definitions */
export type GuardedString = string

/** Primitive number type for field definitions */
export type GuardedNumber = number

/** Primitive boolean type for field definitions */
export type GuardedBoolean = boolean

/** 
 * Model definition type for single model references.
 * Represents a complete model definition.
 */
export type GuardedModel<TModel extends Model> = ModelDefinition<TModel>

/** 
 * Definition for string arrays. 
 * Allows either:
 * - Actual string array: `string[]`
 * - TypeScript constructor hint: `[String]` or `[StringConstructor]`
 */
export type GuardedStringArray = string[] | [String | StringConstructor]

/** 
 * Definition for number arrays.
 * Allows either:
 * - Actual number array: `number[]`
 * - TypeScript constructor hint: `[Number]` or `[NumberConstructor]`
 */
export type GuardedNumberArray = number[] | [Number | NumberConstructor]

/** 
 * Definition for boolean arrays.
 * Allows either:
 * - Actual boolean array: `boolean[]`
 * - TypeScript constructor hint: `[Boolean]` or `[BooleanConstructor]`
 */
export type GuardedBooleanArray = boolean[] | [Boolean | BooleanConstructor]

/** 
 * Definition for model arrays.
 * Uses tuple form to capture model definition: `[ModelDefinition<TModel>]`
 */
export type GuardedModelArray<TModel extends Model> = [ModelDefinition<TModel>]

/** 
 * Special definition for enumerable model arrays.
 * Adds loose mode option for non-strict relationships.
 * 
 * ### Options
 * - `[ModelDefinition<Model>]`: Strict relationship
 * - `[ModelDefinition<Model>, { loose?: boolean }]`: Optional loose mode
 */
export type GuardedEnumerableModelArray<Model extends EnumerableModel> =
  | [ModelDefinition<Model>]
  | [ModelDefinition<Model>, { loose?: boolean }]

export type ModelValues<M extends Model> = {
  [property in keyof M]?:
  NonNullable<M[property]> extends Array<EnumerableModel>
  ? Array<ModelValues<Unarray<NonNullable<M[property]>>> | string | undefined>
  : NonNullable<M[property]> extends Model
  ? ModelValues<NonNullable<M[property]>> | string | undefined
  : M[property];
};

export type StorageResult<M extends Model> =
  | ModelValues<M>
  | null
  | undefined;

export type Storage<M extends Model> = {
  get?: (id: ModelIdentifier) => StorageResult<M> | Promise<StorageResult<M>>;

  set?: (
    id: ModelIdentifier,
    values: M | null,
    keys: [keyof M],
  ) => StorageResult<M> | Promise<StorageResult<M>>;

  list?: (
    id: ModelIdentifier,
  ) => Array<StorageResult<M>> | Promise<Array<StorageResult<M>>>;

  observe?: (id: ModelIdentifier, model: M | null, lastModel: M | null) => void;

  cache?: boolean | number;
  offline?: boolean | number;
  loose?: boolean;
};

// Enumerable - This overload must be the first one, then its signature and documentation will be displayed in intelephence by default.
export function store<E, M extends EnumerableModel>(
  model: ModelDefinition<M>,
  options?: { draft?: false; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M | undefined>;

// Enumerable Draft
export function store<E, M extends EnumerableModel>(
  model: ModelDefinition<M>,
  options: { draft: true; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M>;

// Enumerable Listing
export function store<E, M extends EnumerableModel>(
  model: [ModelDefinition<M>],
  options?: {
    draft?: false;
    id?: keyof E | ((host: E) => ModelIdentifier);
    loose?: boolean;
  },
): Descriptor<E, M[]>;

// Singleton
export function store<E, M extends SingletonModel>(
  model: M extends Array<any> ? never : ModelDefinition<M>,
  options?: { draft?: false; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M>;

// Singleton Draft
export function store<E, M extends SingletonModel>(
  model: M extends Array<any> ? never : ModelDefinition<M>,
  options: { draft: true; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M>;

export namespace store {
  const connect = "__store__connect__";

  function get<M extends Model>(
    Model: ModelDefinition<M>,
    id?: ModelIdentifier,
  ): M;
  function get<M extends Model>(
    Model: [ModelDefinition<M>],
    id?: ModelIdentifier,
  ): M[];

  function set<M extends Model>(
    model: ModelDefinition<M>,
    values: NoInfer<ModelValues<M>>,
  ): Promise<M>;
  function set<M extends SingletonModel>(
    model: ModelDefinition<M>,
    values: null,
  ): Promise<M>;
  function set<M extends Model>(
    model: M,
    values: NoInfer<ModelValues<M> | null>,
  ): Promise<M>;

  function sync<M extends Model>(
    model: ModelDefinition<M>,
    values: NoInfer<ModelValues<M>>,
  ): M;
  function sync<M extends SingletonModel>(
    model: ModelDefinition<M>,
    values: null,
  ): M;
  function sync<M extends Model>(
    model: M,
    values: NoInfer<ModelValues<M> | null>,
  ): M;

  function clear<M extends Model>(
    model: ModelDefinition<M> | [ModelDefinition<M>] | M,
    clearValue?: boolean,
  ): void;

  function pending<M extends Model>(model: M): false | Promise<M>;
  function pending<M extends Model>(
    ...models: Array<M>
  ): false | Promise<typeof models>;

  function error<M extends Model>(
    model: M,
    propertyName?: keyof M | null,
  ): false | Error | any;

  function ready<M extends Model>(model: M): boolean;
  function ready<M extends Model>(...models: Array<M>): boolean;

  function submit<M extends Model>(
    draft: M,
    values?: ModelValues<M>,
  ): Promise<M>;

  function resolve<M extends Model>(model: M): Promise<M>;
  function resolve<M extends Model>(
    model: ModelDefinition<M>,
    id?: ModelIdentifier,
  ): Promise<M>;
  function resolve<M extends Model>(
    model: [ModelDefinition<M>],
    id?: ModelIdentifier,
  ): Promise<M[]>;

  function ref<T>(fn: Reference<T>): Reference<T>;

  function record<V>(value: FieldDefinition<NoInfer<V>>): StoreRecord<V>;

  interface ValidateFunction<M extends Model, T> {
    (value: T, key: string, model: M): string | boolean | void;
  }

  function value<M extends Model>(
    defaultValue: string,
    validate?: ValidateFunction<M, string> | RegExp,
    errorMessage?: string,
  ): string;
  function value<M extends Model>(
    defaultValue: number,
    validate?: ValidateFunction<M, number> | RegExp,
    errorMessage?: string,
  ): number;
  function value<M extends Model>(
    defaultValue: boolean,
    validate?: ValidateFunction<M, number> | RegExp,
    errorMessage?: string,
  ): boolean;
}

/* Router */

export interface ViewOptions<> {
  url?: string;
  multiple?: boolean;
  dialog?: boolean;
  replace?: boolean;
  stack?: ComponentBase[] | (() => ComponentBase[]);
  guard?: () => boolean;
}

export function router<E>(
  views:
    | ComponentBase
    | ComponentBase[]
    | (() => ComponentBase | ComponentBase[]),
  options?: {
    url?: string;
    params?: Array<keyof E>;
    transition?: boolean;
  },
): Descriptor<E, HTMLElement[]>;

export namespace router {
  const connect = "__router__connect__";

  function debug(value?: boolean): void;

  type UrlParams<E> = {
    [property in keyof E]?: E[property];
  };

  type UrlOptions = {
    scrollToTop?: boolean;
  };

  function url<E>(
    view: ComponentBase,
    params?: UrlParams<E> & UrlOptions,
  ): URL | "";

  function backUrl(options?: { nested?: boolean } & UrlOptions): URL | "";
  function guardUrl(params?: UrlParams<any> & UrlOptions): URL | "";
  function currentUrl<E>(params?: UrlParams<E> & UrlOptions): URL | "";

  function active(
    views: ComponentBase | ComponentBase[],
    options?: { stack?: boolean },
  ): boolean;

  function resolve<P>(event: Event, promise: Promise<P>): Promise<P>;
}

/* Localize */
export type Messages = {
  [key: string]: {
    message:
    | string
    | {
      zero?: string;
      one?: string;
      two?: string;
      few?: string;
      many?: string;
      other?: string;
    };
    description?: string;
  };
};

export function localize(lang: string, messages: Messages): void;
export function localize(
  translate: (
    key: string,
    context: string,
  ) => string | ((num: number) => string),
  options?: {
    format?: "chrome.i18n";
  },
): void;

export namespace localize {
  const languages: string[];
}

export function msg(parts: TemplateStringsArray, ...args: unknown[]): string;

export namespace msg {
  function html<E>(
    parts: TemplateStringsArray,
    ...args: unknown[]
  ): UpdateFunctionWithMethods<E>;

  function svg<E>(
    parts: TemplateStringsArray,
    ...args: unknown[]
  ): UpdateFunctionWithMethods<E>;
}

/* Utils */

export function dispatch(
  host: EventTarget,
  eventType: string,
  options?: CustomEventInit,
): boolean;

export function debug(): void;

/* Template Engine */

export interface UpdateFunctionWithMethods<E> extends UpdateFunction<E> {
  key: (id: any) => this;
  style: (...styles: Array<string | CSSStyleSheet>) => this;
  css: (parts: TemplateStringsArray, ...args: unknown[]) => this;
  use: (fn: (template: UpdateFunction<E>) => UpdateFunction<E>) => this;
}

export interface EventHandler<E> {
  (host: E & HTMLElement, event?: Event): any;
}

export function html<E>(
  parts: TemplateStringsArray,
  ...args: unknown[]
): UpdateFunctionWithMethods<E>;

export namespace html {
  function set<E>(property: keyof E, valueOrPath?: any): EventHandler<E>;
  function set<E, M>(property: M, valueOrPath: string | null): EventHandler<E>;

  function resolve<E>(
    promise: Promise<any>,
    placeholder?: UpdateFunction<E>,
    delay?: number,
  ): UpdateFunction<E>;

  function transition<E>(template: UpdateFunction<E>): UpdateFunction<E>;

  function msg(parts: TemplateStringsArray, ...args: unknown[]): string;
}

export function svg<E>(
  parts: TemplateStringsArray,
  ...args: unknown[]
): UpdateFunctionWithMethods<E>;

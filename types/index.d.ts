/**
 * A single property of the component definition - either a default value
 * (shorthand syntax), a getter function called with the element instance,
 * or a full {@link Descriptor} object.
 *
 * @see https://hybrids.js.org/#/component-model/structure.md
 */
export type Property<E, V> =
  | (V extends string | number | boolean | null | undefined ? V : never)
  | ((host: E & HTMLElement, value?: any) => V)
  | Descriptor<E, V>;

/**
 * The full syntax of the property definition with the cached `value` and
 * optional lifecycle methods and options.
 *
 * @see https://hybrids.js.org/#/component-model/structure.md#property-descriptor
 */
export interface Descriptor<E, V> {
  /**
   * The default value, or a getter function called with the element instance
   * and the last cached value. The result is cached until one of the used
   * properties changes.
   */
  value: V | ((host: E & HTMLElement, value?: any) => V);

  /**
   * Called when the element is connected to the DOM. Return a function to
   * clean up the setup when the element is disconnected. Call `invalidate()`
   * to force recalculation of the property value.
   */
  connect?(
    host: E & HTMLElement & { __property_key__: V },
    key: "__property_key__",
    invalidate: () => void,
  ): Function | void;
  /**
   * Called asynchronously when the element connects and every time the
   * property value changes. Use it for side effects.
   */
  observe?(host: E & HTMLElement, value: V, lastValue: V): void;
  /**
   * Reflects the value back to the corresponding dash-cased attribute. Set it
   * to `true`, or to a function transforming the value into a string.
   */
  reflect?: boolean | ((value: V) => string);
}

/**
 * A function returned by the template engine, which updates the `target`
 * of the `host` element. Use it as a value of the `render` property.
 */
export interface UpdateFunction<E> {
  (host: E & HTMLElement, target?: ShadowRoot | Text | E): void;
}

/**
 * A getter of the `render` property, which returns an update function
 * created by the `html` or `svg` template engine.
 */
export interface RenderFunction<E> {
  (host: E & HTMLElement): UpdateFunction<E>;
}

/**
 * The full syntax of the `render` property with the `shadow` option, which
 * controls how the template is attached to the element.
 *
 * @see https://hybrids.js.org/#/component-model/structure.md#render
 */
export interface RenderDescriptor<E> extends Descriptor<E, RenderFunction<E>> {
  value: RenderFunction<E>;
  reflect?: never;
  /**
   * Set to `false` to render into the light DOM, or pass options for the
   * `host.attachShadow()` method. Defaults to `true`.
   */
  shadow?: boolean | ShadowRootInit;
}

/**
 * A minimal shape of the defined component - a definition with a `tag` name,
 * which can be used as a router view or in the `parent()` and `children()`
 * factories.
 */
export type ComponentBase = {
  tag: string;
  __router__connect__?: ViewOptions;
};

/**
 * A map of the component properties with a required `tag` name, which
 * describes the structure and behavior of the custom element.
 *
 * @see https://hybrids.js.org/#/component-model/structure.md
 */
export type Component<E> = ComponentBase & {
  [
    property in Extract<keyof Omit<E, keyof HTMLElement>, string>
  ]: property extends "render"
    ? RenderFunction<E> | RenderDescriptor<E>
    : Property<E, E[property]>;
} & {
  render?: RenderFunction<E> | RenderDescriptor<E>;
};

/**
 * A constructor of the custom element created from the component definition.
 */
export interface HybridElement<E> {
  new (): E & HTMLElement;
  prototype: E & HTMLElement;
}

/* Define */

/**
 * Defines a custom element from the component definition and registers it in
 * the global custom elements registry using the `tag` property.
 *
 * ```js
 * export default define({
 *   tag: "my-element",
 *   name: "",
 *   render: ({ name }) => html`<div>Hello ${name}!</div>`,
 * });
 * ```
 *
 * @param component - a map of properties with a `tag` name
 * @returns the passed component definition
 *
 * @see https://hybrids.js.org/#/component-model/definition.md
 */
export function define<E>(component: Component<E>): typeof component;

export namespace define {
  /**
   * Compiles the component definition into a custom element constructor
   * without registering it in the global registry. Useful for shipping
   * components without depending on a tag name.
   *
   * @param component - a map of properties without the `tag` name
   * @returns a custom element constructor
   *
   * @see https://hybrids.js.org/#/component-model/definition.md#external-usage
   */
  function compile<E>(component: Component<E>): HybridElement<E>;

  /**
   * Defines multiple components at once from a map of definitions, where keys
   * are tag names or module paths (slashes are replaced with dashes, the file
   * extension is removed, and camelCase is converted to dash-case).
   *
   * ```js
   * define.from(
   *   import.meta.glob("./components/*.js", { eager: true, import: "default" }),
   *   { root: "components" },
   * );
   * ```
   *
   * @param components - a map of component definitions
   * @param options.prefix - a prefix added to the generated tag names
   * @param options.root - a path or list of paths removed from the tag names
   *
   * @see https://hybrids.js.org/#/component-model/definition.md#multiple-components
   */
  function from(
    components: { [path: string]: Component<any> },
    options?: { prefix?: string; root?: string | string[] },
  ): void;
}

/* Mount */

/**
 * Attaches the component definition to an existing DOM element instead of
 * defining a new custom element. Useful for a full-page app setup, where the
 * target is usually the `document.body` element.
 *
 * @param target - a DOM element to attach the definition to
 * @param component - a map of properties without the `tag` name
 * @returns a function, which detaches the component from the target
 *
 * @see https://hybrids.js.org/#/component-model/definition.md#mounting
 */
export function mount<E>(
  target: HTMLElement,
  component: Component<E>,
): () => void;

/* Factories */

/**
 * Creates a property, which resolves to the closest parent custom element
 * (crossing the Shadow DOM boundary) matching the passed definition. When the
 * parent property invalidates, the value of this property invalidates as well.
 *
 * @param componentOrFn - a component definition, or a function returning `true`
 *   when the checked definition meets the condition
 * @returns a property descriptor, which resolves to `null` or an element
 *
 * @see https://hybrids.js.org/#/component-model/parent-children.md#parent
 */
export function parent<E, V>(
  componentOrFn: Component<V> | ((component: Component<E>) => boolean),
): Descriptor<E, V>;

/**
 * Creates a property, which resolves to a list of child elements (only from
 * the light DOM) matching the passed definition. It invalidates when the
 * element's subtree changes.
 *
 * @param componentOrFn - a component definition, or a function returning `true`
 *   when the checked definition meets the condition
 * @param options.deep - traverse deeper than the direct children
 * @param options.nested - include nested matching children (requires `deep`)
 * @returns a property descriptor, which resolves to an array of elements
 *
 * @see https://hybrids.js.org/#/component-model/parent-children.md#children
 */
export function children<E, V>(
  componentOrFn: Component<V> | ((component: Component<E>) => boolean),
  options?: { deep?: boolean; nested?: boolean },
): Descriptor<E, V[]>;

/* Store */

/**
 * A base shape of the model instance - a plain object, which is not an array
 * and not a model definition.
 */
export type ModelInstance = { id?: ModelIdentifier } & object &
  NonArrayObject &
  NonModelDefinition;
/** A model instance with a required `id` identifier - one of many instances. */
export type EnumerableInstance = { id: ModelIdentifier } & ModelInstance;
/** A model instance without an identifier - a single global instance. */
export type SingletonInstance = { id?: never } & ModelInstance;

export type Unarray<T> = T extends Array<infer U> ? U : T;
export type NonConstructor = { readonly prototype?: never };
export type NonArrayObject = { [Symbol.iterator]?: never } & object;
export type NonModelDefinition = { __store__connect__?: never } & object;

/**
 * A model definition - a plain object describing the structure of the model
 * instance by its default values, with an optional `[store.connect]` storage.
 *
 * @see https://hybrids.js.org/#/store/model.md
 */
export type Model<M extends ModelInstance> = NonArrayObject & {
  [property in keyof Omit<M, "id">]-?: NonNullable<
    M[property]
  > extends Array<any>
    ? | NestedArrayModel<NonNullable<M[property]>>
      | (NonConstructor &
          ((
            model: M,
          ) => undefined extends M[property]
            ? undefined | NestedArrayModel<M[property]>
            : NestedArrayModel<M[property]>))
    : NonNullable<M[property]> extends string | String
      ? string | (NonConstructor & ((model: M) => M[property]))
      : NonNullable<M[property]> extends number | Number
        ? number | (NonConstructor & ((model: M) => M[property]))
        : NonNullable<M[property]> extends boolean | Boolean
          ? boolean | (NonConstructor & ((model: M) => M[property]))
          : NonNullable<M[property]> extends ModelInstance
            ? | Model<NonNullable<M[property]>>
              | (NonConstructor &
                  ((
                    model: M,
                  ) => undefined extends M[property]
                    ? undefined | Model<NonNullable<M[property]>>
                    : Model<NonNullable<M[property]>>))
            : NonNullable<M[property]> extends NonArrayObject
              ? | NonNullable<M[property]>
                | (NonConstructor & ((model: M) => M[property]))
              : never;
} & (M extends EnumerableInstance
    ? {
        id: true;
      }
    : {}) & {
    __store__connect__?: Storage<M> | Storage<M>["get"];
  };

export type NestedArrayModel<T> =
  NonNullable<Unarray<T>> extends string | String
    ? T | string[] | [String | StringConstructor]
    : NonNullable<Unarray<T>> extends number | Number
      ? T | number[] | [Number | NumberConstructor]
      : NonNullable<Unarray<T>> extends boolean | Boolean
        ? T | boolean[] | [Boolean | BooleanConstructor]
        : NonNullable<Unarray<T>> extends EnumerableInstance
          ? | [Model<NonNullable<Unarray<T>>>]
            | [Model<NonNullable<Unarray<T>>>, { loose?: boolean }]
          : NonNullable<Unarray<T>> extends NonArrayObject
            ? T
            : never;

/**
 * An identifier of the enumerable model instance - a string, or an object map
 * of parameters (for example, for a paginated listing).
 *
 * @see https://hybrids.js.org/#/store/model.md#identifier
 */
export type ModelIdentifier =
  string | Record<string, string | boolean | number | null> | undefined;

/**
 * A deep partial structure of the model instance values, which can be passed
 * to the `store.set()` and `store.sync()` methods.
 */
export type ModelValues<M extends ModelInstance> = {
  [property in keyof M]?: NonNullable<M[property]> extends Array<any>
    ? Array<ModelValues<Unarray<NonNullable<M[property]>>>>
    : NonNullable<M[property]> extends ModelInstance
      ? ModelValues<NonNullable<M[property]>>
      : M[property];
};

export type StorageValues<M extends ModelInstance> = {
  [property in keyof M]?: NonNullable<M[property]> extends EnumerableInstance
    ? NonNullable<M[property]> | M["id"]
    : NonNullable<M[property]> extends EnumerableInstance[]
      ? (NonNullable<Unarray<M[property]>> | M["id"])[]
      : M[property];
};

export type StorageResult<M extends ModelInstance> =
  StorageValues<M> | null | undefined;

/**
 * An external storage definition set in the `[store.connect]` property of the
 * model definition, which connects the model to an async data source.
 *
 * @see https://hybrids.js.org/#/store/storage.md
 */
export type Storage<M extends ModelInstance> = {
  /** Fetches a single model instance by its identifier. */
  get?: (id: ModelIdentifier) => StorageResult<M> | Promise<StorageResult<M>>;

  /**
   * Creates, updates (when `values` are passed), or deletes (when `values` are
   * `null`) the model instance. `keys` contains the names of updated values.
   */
  set?: (
    id: ModelIdentifier,
    values: M | null,
    keys: [keyof M],
  ) => StorageResult<M> | Promise<StorageResult<M>>;

  /** Fetches a list of model instances for the listing definition. */
  list?: (
    id: ModelIdentifier,
  ) => Array<StorageResult<M>> | Promise<Array<StorageResult<M>>>;

  /** Called when the model instance is created, updated, or deleted. */
  observe?: (id: ModelIdentifier, model: M | null, lastModel: M | null) => void;

  /**
   * The expiration time of the cached value - `true` for a persistent cache,
   * `false` or `0` to always call the source, or a time in milliseconds.
   * Defaults to `true`.
   */
  cache?: boolean | number;
  /**
   * Enables a persistent cache layer in `localStorage` for offline access -
   * `true` for a thirty-day expiration, or a time in milliseconds.
   * Defaults to `false`.
   */
  offline?: boolean | number;
  /**
   * Invalidates the listing of the enumerable model when one of its instances
   * changes, so the order and content of the list can be updated.
   * Defaults to `false`.
   */
  loose?: boolean;
};

/**
 * Creates a property, which resolves to the model instance, a list of
 * instances, or their placeholders (use `store.ready()`, `store.pending()` and
 * `store.error()` guards to check the current state).
 *
 * ```js
 * define({
 *   tag: "my-element",
 *   userId: "",
 *   user: store(User, { id: "userId" }),
 * });
 * ```
 *
 * @param model - a model definition, or a definition wrapped in an array for a
 *   listing of the enumerable model
 * @param options.id - a host property name, or a function returning the
 *   identifier of the model instance from the host
 * @param options.draft - creates a copy of the instance for form manipulation,
 *   which can be saved by the `store.submit()` method
 * @returns a property descriptor connected to the store
 *
 * @see https://hybrids.js.org/#/store/usage.md#factory
 */
// Enumerable - This overload must be the first one, then its signature and documentation will be displayed in intelephence by default.
export function store<E, M extends EnumerableInstance>(
  model: Model<M>,
  options?: { draft?: false; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M | undefined>;

// Enumerable Draft
export function store<E, M extends EnumerableInstance>(
  model: Model<M>,
  options: { draft: true; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M>;

// Enumerable Listing
export function store<E, M extends EnumerableInstance>(
  model: [Model<M>],
  options?: {
    draft?: false;
    id?: keyof E | ((host: E) => ModelIdentifier);
    loose?: boolean;
  },
): Descriptor<E, M[]>;

// Singleton
export function store<E, M extends SingletonInstance>(
  model: M extends Array<any> ? never : Model<M>,
  options?: { draft?: false; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M>;

// Singleton Draft
export function store<E, M extends SingletonInstance>(
  model: M extends Array<any> ? never : Model<M>,
  options: { draft: true; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M>;

export namespace store {
  /**
   * A key of the model definition property, which connects the model to an
   * external storage.
   *
   * @see https://hybrids.js.org/#/store/storage.md#external
   */
  const connect = "__store__connect__";

  /**
   * Returns the model instance for the given identifier. If the value is not
   * cached yet, it returns a placeholder and fetches the data from the storage.
   *
   * @param Model - a model definition, or a definition wrapped in an array
   *   for a listing of the enumerable model
   * @param id - an identifier of the model instance
   * @returns a model instance or its placeholder
   *
   * @see https://hybrids.js.org/#/store/usage.md#storeget
   */
  function get<M extends ModelInstance>(
    Model: Model<M>,
    id?: ModelIdentifier,
  ): M;
  function get<M extends ModelInstance>(
    Model: [Model<M>],
    id?: ModelIdentifier,
  ): M[];

  /**
   * Creates or updates the model instance in the storage. Pass a model
   * definition to create a new instance, or a model instance to update it
   * (with `null` values to delete it).
   *
   * @param model - a model definition or a model instance
   * @param values - partial values of the model, or `null` to delete it
   * @returns a promise resolving to the model instance
   *
   * @see https://hybrids.js.org/#/store/usage.md#storeset
   */
  function set<M extends ModelInstance>(
    model: Model<M> | M,
    values: ModelValues<M> | null,
  ): Promise<M>;
  /**
   * Updates the cache of the model instance synchronously, without calling the
   * storage. Use it to feed the store with data fetched by other means.
   *
   * @param model - a model definition or a model instance
   * @param values - partial values of the model, or `null` to delete it
   * @returns a model instance or its placeholder
   *
   * @see https://hybrids.js.org/#/store/usage.md#storesync
   */
  function sync<M extends ModelInstance>(
    model: Model<M> | M,
    values: ModelValues<M> | null,
  ): M;
  /**
   * Invalidates the cached value of the model instance, or of all instances of
   * the model definition, so the next call fetches data from the storage again.
   *
   * @param model - a model definition (all instances) or a model instance
   * @param clearValue - when `false`, the value is only marked as expired
   *   instead of being deleted. Defaults to `true`
   *
   * @see https://hybrids.js.org/#/store/usage.md#storeclear
   */
  function clear<M extends ModelInstance>(
    model: Model<M> | [Model<M>] | M,
    clearValue?: boolean,
  ): void;

  /**
   * A guard, which returns a promise resolving with the next model value when
   * the instance is in the pending state, or `false` otherwise.
   *
   * @see https://hybrids.js.org/#/store/usage.md#storepending
   */
  function pending<M extends ModelInstance>(model: M): false | Promise<M>;
  function pending<M extends ModelInstance>(
    ...models: Array<M>
  ): false | Promise<typeof models>;

  /**
   * A guard, which returns the error of the model instance, or `false` if the
   * instance is not in the error state.
   *
   * @param model - a model instance
   * @param propertyName - a property name with a failed validation defined by
   *   the `store.value()` method, or `null` for the general error message only
   *
   * @see https://hybrids.js.org/#/store/usage.md#storeerror
   */
  function error<M extends ModelInstance>(
    model: M,
    propertyName?: keyof M | null,
  ): false | Error | any;

  /**
   * A guard, which returns `true` when the passed model instances contain
   * valid values (they are not placeholders).
   *
   * @see https://hybrids.js.org/#/store/usage.md#storeready
   */
  function ready<M extends ModelInstance>(model: M): boolean;
  function ready<M extends ModelInstance>(...models: Array<M>): boolean;

  /**
   * Submits the draft instance created by the `store(Model, { draft: true })`
   * factory to the primary model definition.
   *
   * @param draft - an instance of the draft model
   * @param values - optional values merged on top of the draft values
   * @returns a promise resolving with the primary model instance
   *
   * @see https://hybrids.js.org/#/store/usage.md#draft-mode
   */
  function submit<M extends ModelInstance>(
    draft: M,
    values?: ModelValues<M>,
  ): Promise<M>;

  /**
   * Returns a promise, which resolves with the latest model value when it is
   * ready, or rejects with the error of the model instance.
   *
   * @see https://hybrids.js.org/#/store/usage.md#storeresolve
   */
  function resolve<M extends ModelInstance>(model: M): Promise<M>;
  function resolve<M extends ModelInstance>(
    model: Model<M>,
    id?: ModelIdentifier,
  ): Promise<M>;
  function resolve<M extends ModelInstance>(
    model: [Model<M>],
    id?: ModelIdentifier,
  ): Promise<M[]>;

  /**
   * Defines a model property lazily, using the result of the passed function.
   * Use it for self-references and to avoid import cycles between models.
   *
   * @param fn - a function returning the property definition
   * @returns the passed function, marked for the store
   *
   * @see https://hybrids.js.org/#/store/model.md#self-reference--import-cycles
   */
  function ref<T>(fn: () => T): () => T;

  /**
   * Defines a model property as a map with variable keys, where each value
   * follows the passed definition.
   *
   * @param value - any supported property value
   * @returns a record definition (an empty object)
   *
   * @see https://hybrids.js.org/#/store/model.md#record
   */
  function record<V>(value: V): Record<string, V>;
  function record<V extends () => {}>(value: V): Record<string, ReturnType<V>>;

  interface ValidateFunction<M extends ModelInstance, T> {
    (value: T, key: string, model: M): string | boolean | void;
  }

  /**
   * Defines a required model property with a validation, which is checked
   * before the values are sent to the storage.
   *
   * @param defaultValue - a `string`, `number` or `boolean` default value
   * @param validate - a validation function returning `false`, an error
   *   message, or throwing an error; or a `RegExp` instance. When omitted, the
   *   default validation fails for falsy values
   * @param errorMessage - an error message used when the validation fails
   *
   * @see https://hybrids.js.org/#/store/model.md#validation
   */
  function value<M extends ModelInstance>(
    defaultValue: string,
    validate?: ValidateFunction<M, string> | RegExp,
    errorMessage?: string,
  ): string;
  function value<M extends ModelInstance>(
    defaultValue: number,
    validate?: ValidateFunction<M, number> | RegExp,
    errorMessage?: string,
  ): number;
  function value<M extends ModelInstance>(
    defaultValue: boolean,
    validate?: ValidateFunction<M, number> | RegExp,
    errorMessage?: string,
  ): boolean;

  /**
   * Observes changes of the model instances outside of the model definition.
   * The callback is called for updates made after the observer is set.
   *
   * @param model - a model definition
   * @param callback - called with the identifier, the new model instance, and
   *   the last model instance
   * @returns a function, which stops observing
   *
   * @see https://hybrids.js.org/#/store/usage.md#storeobserve
   */
  function observe<M extends ModelInstance>(
    model: Model<M>,
    callback: (
      id: ModelIdentifier,
      model: M | null,
      lastModel: M | null,
    ) => void,
  ): () => void;
}

/* Router */

/**
 * A configuration of the view set in the `[router.connect]` property of the
 * component definition.
 *
 * @see https://hybrids.js.org/#/router/view.md#configuration
 */
export interface ViewOptions {
  /** A URL pattern of the view, for example `"/users/:userId"`. */
  url?: string;
  /** Allows stacking the same view multiple times. Defaults to `false`. */
  multiple?: boolean;
  /**
   * Displays the view on top of the parent view instead of replacing it.
   * Defaults to `false`.
   */
  dialog?: boolean;
  /**
   * Reloads the view from scratch when the history entry is replaced.
   * Defaults to `false`.
   */
  replace?: boolean;
  /** A list of views placed on the stack when navigating from this view. */
  stack?: ComponentBase[] | (() => ComponentBase[]);
  /**
   * A synchronous function called before entering the view or its stack. When
   * it returns a falsy value, the guarded view is displayed instead.
   */
  guard?: () => boolean;
}

/**
 * Creates a property, which resolves to a stack of view elements and takes
 * over the browser history and URL of the application.
 *
 * ```js
 * define({
 *   tag: "my-app",
 *   stack: router(Home),
 *   render: ({ stack }) => html`<main>${stack}</main>`,
 * });
 * ```
 *
 * @param views - a root view definition, a list of views, or a function
 *   returning them (useful with import cycles)
 * @param options.url - a base URL for views without their own `url` option
 * @param options.params - host property names passed to every view
 * @param options.transition - sets the `<html router-transition="">` attribute
 *   with the type of the transition between views
 * @returns a property descriptor, which resolves to an array of elements
 *
 * @see https://hybrids.js.org/#/router/usage.md
 */
export function router<E>(
  views:
    ComponentBase | ComponentBase[] | (() => ComponentBase | ComponentBase[]),
  options?: {
    url?: string;
    params?: Array<keyof E>;
    transition?: boolean;
  },
): Descriptor<E, HTMLElement[]>;

export namespace router {
  /**
   * A key of the component definition property, which configures the view
   * options, like the `url` or the `stack` of nested views.
   *
   * @see https://hybrids.js.org/#/router/view.md#configuration
   */
  const connect = "__router__connect__";

  /**
   * Enables logging of the navigation events and exposes the current view in
   * the DevTools console via the `$$0` reference.
   *
   * @see https://hybrids.js.org/#/router/usage.md#debug-mode
   */
  function debug(value?: boolean): void;

  type UrlParams<E> = {
    [property in keyof E]?: E[property];
  };

  type UrlOptions = {
    scrollToTop?: boolean;
  };

  /**
   * Generates a URL for the view, which can be used as the `href` attribute of
   * an anchor element to navigate to it.
   *
   * @param view - a view definition
   * @param params - parameters passed to the view, plus the `scrollToTop`
   *   option
   * @returns a `URL` instance, or an empty string if the view is not found
   *
   * @see https://hybrids.js.org/#/router/usage.md#routerurl
   */
  function url<E>(
    view: ComponentBase,
    params?: UrlParams<E> & UrlOptions,
  ): URL | "";

  /**
   * Generates a URL to the previous view in the stack. Use the `nested` option
   * inside of a nested router to go back within its own stack.
   *
   * @see https://hybrids.js.org/#/router/usage.md#routerbackurl
   */
  function backUrl(options?: { nested?: boolean } & UrlOptions): URL | "";
  /**
   * Generates a URL to the view, which the user tried to reach before being
   * redirected by the `guard` option of the current view.
   *
   * @see https://hybrids.js.org/#/router/usage.md#routerguardurl
   */
  function guardUrl(params?: UrlParams<any> & UrlOptions): URL | "";
  /**
   * Generates a URL to the current view with updated parameters.
   *
   * @see https://hybrids.js.org/#/router/usage.md#routercurrenturl
   */
  function currentUrl<E>(params?: UrlParams<E> & UrlOptions): URL | "";

  /**
   * Checks if the passed views are currently active. Use the `stack` option to
   * also match views, which are parents of the current view.
   *
   * @see https://hybrids.js.org/#/router/usage.md#routeractive
   */
  function active(
    views: ComponentBase | ComponentBase[],
    options?: { stack?: boolean },
  ): boolean;

  /**
   * Delays the navigation triggered by the anchor `click` or the form `submit`
   * event until the promise resolves.
   *
   * @param event - a `click` or `submit` event
   * @param promise - a promise, which must resolve to navigate
   * @returns a chained promise
   *
   * @see https://hybrids.js.org/#/router/usage.md#routerresolve
   */
  function resolve<P>(event: Event, promise: Promise<P>): Promise<P>;
}

/* Localize */

/**
 * A dictionary of translated messages, where keys are the message keys
 * (usually the original text content) with an optional `| context` suffix.
 *
 * @see https://hybrids.js.org/#/component-model/localization.md#messages
 */
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

/**
 * Adds translated messages to the dictionary, or sets a custom translation
 * function. It must be called before the first render of the components.
 *
 * ```js
 * localize("pl", { "Hello ${0}!": { message: "Witaj ${0}!" } });
 * ```
 *
 * @param lang - a language code, with or without a region, or `"default"` for
 *   the fallback language
 * @param messages - a map of translated messages
 *
 * @see https://hybrids.js.org/#/component-model/localization.md#messages
 */
export function localize(lang: string, messages: Messages): void;
/**
 * Sets a global custom translation function, which is called when the message
 * is not found in the built-in dictionary.
 *
 * @param translate - a function returning the translation, or a function
 *   taking a number and returning the plural form
 * @param options.format - transforms keys to a custom format; for now only
 *   `"chrome.i18n"` is supported
 *
 * @see https://hybrids.js.org/#/component-model/localization.md#custom-function
 */
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
  /**
   * The list of the user's preferred language codes, useful for fetching
   * translation messages from an async source.
   */
  const languages: string[];
}

/**
 * Translates a message manually, outside of the automatic translation of the
 * template text content. Supports plural forms based on the first expression.
 *
 * ```js
 * html`<my-button name="${msg`Submit`}"></my-button>`
 * ```
 *
 * @see https://hybrids.js.org/#/component-model/localization.md#manual-translation
 */
export function msg(parts: TemplateStringsArray, ...args: unknown[]): string;

export namespace msg {
  /**
   * Translates a message with HTML content and returns a nested template.
   * The content is not sanitized, so use it only with trusted messages.
   *
   * @see https://hybrids.js.org/#/component-model/localization.md#html--svg-content
   */
  function html<E>(
    parts: TemplateStringsArray,
    ...args: unknown[]
  ): UpdateFunctionWithMethods<E>;

  /**
   * Translates a message with SVG content and returns a nested template.
   * The content is not sanitized, so use it only with trusted messages.
   *
   * @see https://hybrids.js.org/#/component-model/localization.md#html--svg-content
   */
  function svg<E>(
    parts: TemplateStringsArray,
    ...args: unknown[]
  ): UpdateFunctionWithMethods<E>;
}

/* Utils */

/**
 * Creates and dispatches a `CustomEvent` on the host element.
 *
 * @param host - an element instance
 * @param eventType - a type of the event
 * @param options - a `CustomEventInit` dictionary with the `bubbles`,
 *   `cancelable`, `composed` and `detail` fields
 * @returns `false` if the event is cancelable and one of the handlers called
 *   `preventDefault()`; otherwise `true`
 *
 * @see https://hybrids.js.org/#/component-model/events.md
 */
export function dispatch(
  host: EventTarget,
  eventType: string,
  options?: CustomEventInit,
): boolean;

/**
 * Enables the debug mode of the library, which adds extra logging and error
 * messages. Call it before any other code, only in the development build.
 *
 * @see https://hybrids.js.org/#/getting-started.md#debug-mode
 */
export function debug(): void;

/* Template Engine */

/**
 * An update function returned by the `html` and `svg` template engines with
 * chainable helper methods.
 *
 * @see https://hybrids.js.org/#/component-model/templates.md
 */
export interface UpdateFunctionWithMethods<E> extends UpdateFunction<E> {
  /**
   * Sets a unique key for the template, so a list of items can be efficiently
   * re-ordered instead of re-created.
   *
   * @see https://hybrids.js.org/#/component-model/templates.md#keys
   */
  key: (id: any) => this;
  /**
   * Attaches styles to the template from CSS text contents or from
   * `CSSStyleSheet` instances.
   *
   * @see https://hybrids.js.org/#/component-model/templates.md#style-element
   */
  style: (...styles: Array<string | CSSStyleSheet>) => this;
  /**
   * Attaches styles to the template written as a tagged template literal with
   * support for dynamic expressions.
   *
   * @see https://hybrids.js.org/#/component-model/templates.md#css-content
   */
  css: (parts: TemplateStringsArray, ...args: unknown[]) => this;
  /**
   * Wraps the update function with a plugin, which takes control over the
   * update process. It can be chained.
   *
   * @see https://hybrids.js.org/#/component-model/templates.md#plugins
   */
  use: (fn: (template: UpdateFunction<E>) => UpdateFunction<E>) => this;
}

/**
 * An event listener attached in the template, which is called with the host
 * element instead of the event target.
 *
 * @see https://hybrids.js.org/#/component-model/templates.md#event-listeners
 */
export interface EventHandler<E> {
  (host: E & HTMLElement, event?: Event): any;
}

/**
 * Creates an HTML template from the tagged template literal. Expressions can
 * be used as property values, event listeners, or element content.
 *
 * ```js
 * render: ({ name }) => html`<div>Hello ${name}!</div>`
 * ```
 *
 * @returns an update function with chainable helper methods
 *
 * @see https://hybrids.js.org/#/component-model/templates.md
 */
export function html<E>(
  parts: TemplateStringsArray,
  ...args: unknown[]
): UpdateFunctionWithMethods<E>;

export namespace html {
  /**
   * Creates an event listener, which sets the host property (or the store
   * model value) to the value of the event target, or to a custom value.
   *
   * ```js
   * html`<input value="${value}" oninput="${html.set("value")}" />`
   * ```
   *
   * @see https://hybrids.js.org/#/component-model/templates.md#form-elements
   */
  function set<E>(property: keyof E, valueOrPath?: any): EventHandler<E>;
  function set<E, M>(property: M, valueOrPath: string | null): EventHandler<E>;

  /**
   * Renders the placeholder until the promise resolves to the content.
   * A promise can also be passed directly to the content expression,
   * but then the placeholder is not supported.
   *
   * @param promise - a promise resolving to the content of the expression
   * @param placeholder - a template rendered while the promise is pending
   * @param delay - a delay in milliseconds before the placeholder is rendered.
   *   Defaults to `200`
   *
   * @see https://hybrids.js.org/#/component-model/templates.md#promises
   */
  function resolve<E>(
    promise: Promise<any>,
    placeholder?: UpdateFunction<E>,
    delay?: number,
  ): UpdateFunction<E>;

  /**
   * A built-in plugin, which updates the template using the View Transitions
   * API. Use it with the `use()` method on the root element of the app.
   *
   * ```js
   * render: ({ stack }) => html`<main>${stack}</main>`.use(html.transition)
   * ```
   *
   * @see https://hybrids.js.org/#/component-model/templates.md#transition-api
   */
  function transition<E>(template: UpdateFunction<E>): UpdateFunction<E>;

  /**
   * An alias of the `msg` helper for translating messages inside of templates.
   *
   * @see https://hybrids.js.org/#/component-model/localization.md#manual-translation
   */
  function msg(parts: TemplateStringsArray, ...args: unknown[]): string;
}

/**
 * Creates an SVG template from the tagged template literal. Use it for
 * standalone SVG content - inside of the `html` template, SVG elements are
 * supported out of the box.
 *
 * @returns an update function with chainable helper methods
 *
 * @see https://hybrids.js.org/#/component-model/templates.md
 */
export function svg<E>(
  parts: TemplateStringsArray,
  ...args: unknown[]
): UpdateFunctionWithMethods<E>;

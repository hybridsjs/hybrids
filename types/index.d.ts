// docblock checklist
// - find function declarations (there may be several under one name)
// - external description
// - returns
// - params
// - examples
// - internal description with punctuation

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
  new (): E & HTMLElement;
  prototype: E & HTMLElement;
}

/* Define */

/**
 * Define a web component.
 * 
 * @example
 * import { define } from "hybrids";
 * 
 * export default define({
 *   tag: "my-element",
 *   ...
 * });
 * 
 * @param component an object with map of property descriptors with a tag name set in the `tag` property
 * @returns a passed argument to `define()` function
 * @description [Single Component](https://hybrids.js.org/#/component-model/definition?id=single-component)
 */
export function define<E>(component: Component<E>): typeof component;

export namespace define {
  /**
   * Producing the class without defining the custom element.
   * 
   * This mode can be helpful for creating a custom element for external usage without depending on a tag name, or if the components library is not used directly:
   * 
   * @example
   * // file: library/my-element.ts
   * export default define.compile({
   *     name: "",
   *     render: ({ name }) => html`
   *         <div>Hello ${name}!</div>
   *     `,
   * });
   * 
   * @example
   * // file: application/my-super-element.ts
   * import { MyElement } from "components-library";
   * customElements.define("my-super-element", MyElement); // Register the custom element from the package
   * 
   * @example
   * ```html
   * <!-- file: application/home-page.html -->
   * <my-super-element name="John"></my-super-element>
   * ```
   * 
   * @param component an object with map of hybrid property descriptors without `tag` property
   * @returns a constructor for the custom element (not registered in the global custom elements registry)
   * @description [External Usage](https://hybrids.js.org/#/component-model/definition?id=external-usage)
   */
  function compile<E>(component: Component<E>): HybridElement<E>;

  /**
   * Helper which targets application setup using a bundler, like [Vite](https://vite.dev/).
   * 
   * In the result, with the `define.from()` method, modules with components might skip the tag property,
   * and should export the component definition instead of the result of the define function:
   * 
   * @example
   * // file: ./components/HelloWorld.js
   * export default {
   *     render: () => html`<div>Hello World!</div>`,
   * }
   * 
   * @example
   * // file: ./app.js
   * define.from(
   *     import.meta.glob("./components/*.js", { eager: true, import: "default" }),
   *     { root: "components" }
   * );
   * 
   * @param components an object with map of components with tag names as keys (or paths to the files)
   * @param options an optional object with options
   * @returns a passed argument to `define.from()` function
   * @description [Multiple Components](https://hybrids.js.org/#/component-model/definition?id=multiple-components)
   */
  function from(
    components: { [path: string]: Component<any> },
    options?: {
      /** a prefix added to the tag names */
      prefix?: string;
      /** a string or a list of strings, which is cleared from the tag names */
      root?: string | string[]
    },
  ): void;
}

/* Mount */

/**
 * Attach the component to existing DOM element.
 * 
 * @example
 * import { mount, html, router } from "hybrids";
 * import Home from './views/home.js';
 * const App = {
 *    stack: router(Home),
 *    render: () => html`
 *        <template layout="column">
 *            ...
 *            ${stack}
 *        </template>
 *    `,
 * };
 * mount(document.body, App);
 * 
 * @param target an DOM element to attach the component definition, usually it should be `document.body`
 * @param component an object with map of hybrid property descriptors without `tag` property
 * @description [Mounting](https://hybrids.js.org/#/component-model/definition?id=mounting)
 */
export function mount<E>(
  target: HTMLElement,
  component: Component<E>,
): () => void;

/* Factories */

/**
 * Finds the parent hybrids component by crossing shadows and going all the way up to the `document.body` level.
 * 
 * @example
 * import { define, parent, html } from "hybrids";
 * const MyParent = define({
 *    tag: "my-parent",
 *    count: 0,
 * });
 * const MyElement = define({
 *    tag: "my-element",
 *    parent: parent(MyParent),
 *    render: ({ parent }) => html`count: ${parent.count}`,
 * });
 * 
 * @example
 * ```html
 * <my-parent count="42">
 *     <my-element>
 *         <!-- my-element will render here "count: 42" -->
 *     </my-element>
 * </my-parent>
 * ```
 * 
 * @param componentOrFn reference to an object containing property descriptors or a function, which returns `true` when current `component` meets the condition
 * @returns a property descriptor, which resolves to `null` or `Element` instance
 * @description [Parent](https://hybrids.js.org/#/component-model/parent-children?id=parent)
 */
export function parent<E, V>(
  /** reference to an object containing property descriptors */
  component: Component<V>,
): Descriptor<E, V>;
export function parent<E, V>(
  /** a function, which returns `true` when current `component` meets the condition */
  predicate: (component: Component<E>) => boolean,
): Descriptor<E, V>;
export function parent<E, V>(
  componentOrFn: Component<V> | ((component: Component<E>) => boolean),
): Descriptor<E, V>;

/**
 * 
 * @param componentOrFn 
 * @param options 
 * @description [Children](https://hybrids.js.org/#/component-model/parent-children?id=children)
 */
export function children<E, V>(
  component: Component<V>,
  options?: { deep?: boolean; nested?: boolean },
): Descriptor<E, V[]>;
export function children<E, V>(
  predicate: (component: Component<E>) => boolean,
  options?: { deep?: boolean; nested?: boolean },
): Descriptor<E, V[]>;
export function children<E, V>(
  componentOrFn: Component<V> | ((component: Component<E>) => boolean),
  options?: { deep?: boolean; nested?: boolean },
): Descriptor<E, V[]>;

/* Store */

export type ModelInstance = { id?: ModelIdentifier } & object &
  NonArrayObject &
  NonModelDefinition;
export type EnumerableInstance = { id: ModelIdentifier } & ModelInstance;
export type SingletonInstance = { id?: never } & ModelInstance;

export type Unarray<T> = T extends Array<infer U> ? U : T;
export type NonConstructor = { readonly prototype?: never };
export type NonArrayObject = { [Symbol.iterator]?: never } & object;
export type NonModelDefinition = { __store__connect__?: never } & object;

export type Model<M extends ModelInstance> = NonArrayObject & {
  [property in keyof Omit<M, "id">]-?: NonNullable<
    M[property]
  > extends Array<any>
    ?
        | NestedArrayModel<NonNullable<M[property]>>
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
            ?
                | Model<NonNullable<M[property]>>
                | (NonConstructor &
                    ((
                      model: M,
                    ) => undefined extends M[property]
                      ? undefined | Model<NonNullable<M[property]>>
                      : Model<NonNullable<M[property]>>))
            : NonNullable<M[property]> extends NonArrayObject
              ?
                  | NonNullable<M[property]>
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
          ?
              | [Model<NonNullable<Unarray<T>>>]
              | [Model<NonNullable<Unarray<T>>>, { loose?: boolean }]
          : NonNullable<Unarray<T>> extends NonArrayObject
            ? T
            : never;

export type ModelIdentifier =
  | string
  | Record<string, string | boolean | number | null>
  | undefined;

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
  | StorageValues<M>
  | null
  | undefined;

export type Storage<M extends ModelInstance> = {
  /**
   * 
   * @param id 
   * @returns 
   * @description [_________](___________________________________________________________________)
   */
  get?: (id: ModelIdentifier) => StorageResult<M> | Promise<StorageResult<M>>;

  /**
   * 
   * @param id 
   * @param values 
   * @param keys 
   * @returns 
   * @description [_________](___________________________________________________________________)
   */
  set?: (
    id: ModelIdentifier,
    values: M | null,
    keys: [keyof M],
  ) => StorageResult<M> | Promise<StorageResult<M>>;

  /**
   * 
   * @param id 
   * @returns 
   * @description [_________](___________________________________________________________________)
   */
  list?: (
    id: ModelIdentifier,
  ) => Array<StorageResult<M>> | Promise<Array<StorageResult<M>>>;

  /**
   * 
   * @param id 
   * @param model 
   * @param lastModel 
   * @returns 
   * @description [_________](___________________________________________________________________)
   */
  observe?: (id: ModelIdentifier, model: M | null, lastModel: M | null) => void;

  /**
   * @description [_________](___________________________________________________________________)
   */
  cache?: boolean | number;

  /**
   * @description [_________](___________________________________________________________________)
   */
  offline?: boolean | number;

  /**
   * @description [_________](___________________________________________________________________)
   */
  loose?: boolean;
};

/**
 * 
 * @param model 
 * @param options 
 * @description [Factory](https://hybrids.js.org/#/store/usage?id=factory)
 */
// Enumerable - This overload must be the first one, then its signature and documentation will be displayed in intelephence by default.
export function store<E, M extends EnumerableInstance>(
  model: Model<M>,
  options?: { draft?: false; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M | undefined>;

/**
 * 
 * @param model 
 * @param options 
 * @description [_________](___________________________________________________________________)
 */
// Enumerable Draft
export function store<E, M extends EnumerableInstance>(
  model: Model<M>,
  options: { draft: true; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M>;

/**
 * 
 * @param model 
 * @param options 
 * @description [_________](___________________________________________________________________)
 */
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
/**
 * 
 * @param model 
 * @param options 
 * @description [_________](___________________________________________________________________)
 */
export function store<E, M extends SingletonInstance>(
  model: M extends Array<any> ? never : Model<M>,
  options?: { draft?: false; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M>;

// Singleton Draft
/**
 * 
 * @param model 
 * @param options 
 * @description [_________](___________________________________________________________________)
 */
export function store<E, M extends SingletonInstance>(
  model: M extends Array<any> ? never : Model<M>,
  options: { draft: true; id?: keyof E | ((host: E) => ModelIdentifier) },
): Descriptor<E, M>;

export namespace store {
  const connect = "__store__connect__";

  /**
   * 
   * @param Model 
   * @param id 
   * @description [store.get](https://hybrids.js.org/#/store/usage?id=storeget)
   */
  function get<M extends ModelInstance>(
    Model: Model<M>,
    id?: ModelIdentifier,
  ): M;
  /**
   * 
   * @param Model 
   * @param id 
   * @description [_________](___________________________________________________________________)
   */
  function get<M extends ModelInstance>(
    Model: [Model<M>],
    id?: ModelIdentifier,
  ): M[];

  /**
   * 
   * @param model 
   * @param values 
   * @description [store.set](https://hybrids.js.org/#/store/usage?id=storeset)
   */
  function set<M extends ModelInstance>(
    model: Model<M> | M,
    values: ModelValues<M> | null,
  ): Promise<M>;

  /**
   * 
   * @param model 
   * @param values 
   * @description [store.sync](https://hybrids.js.org/#/store/usage?id=storesync)
   */
  function sync<M extends ModelInstance>(
    model: Model<M> | M,
    values: ModelValues<M> | null,
  ): M;

  /**
   * 
   * @param model 
   * @param clearValue 
   * @description [store.clear](https://hybrids.js.org/#/store/usage?id=storeclear)
   */
  function clear<M extends ModelInstance>(
    model: Model<M> | [Model<M>] | M,
    clearValue?: boolean,
  ): void;

  /**
   * 
   * @param model 
   * @description [store.pending](https://hybrids.js.org/#/store/usage?id=storepending)
   */
  function pending<M extends ModelInstance>(model: M): false | Promise<M>;
  function pending<M extends ModelInstance>(
    ...models: Array<M>
  ): false | Promise<typeof models>;

  /**
   * 
   * @param model 
   * @param propertyName 
   * @description [store.error](https://hybrids.js.org/#/store/usage?id=storeerror)
   */
  function error<M extends ModelInstance>(
    model: M,
    propertyName?: keyof M | null,
  ): false | Error | any;

  /**
   * 
   * @param model 
   * @description [store.ready](https://hybrids.js.org/#/store/usage?id=storeready)
   */
  function ready<M extends ModelInstance>(model: M): boolean;
  function ready<M extends ModelInstance>(...models: Array<M>): boolean;

  /**
   * 
   * @param draft 
   * @param values 
   * @description [Draft Mode](https://hybrids.js.org/#/store/usage?id=draft-mode)
   */
  function submit<M extends ModelInstance>(
    draft: M,
    values?: ModelValues<M>,
  ): Promise<M>;

  /**
   * 
   * @param model 
   * @description [store.resolve](https://hybrids.js.org/#/store/usage?id=storeresolve)
   */
  function resolve<M extends ModelInstance>(model: M): Promise<M>;
  /**
   * 
   * @param model 
   * @description [store.resolve](https://hybrids.js.org/#/store/usage?id=storeresolve)
   */
  function resolve<M extends ModelInstance>(
    Model: Model<M>,
    id?: ModelIdentifier,
  ): Promise<M>;
  function resolve<M extends ModelInstance>(
    Model: [Model<M>],
    id?: ModelIdentifier,
  ): Promise<M[]>;

  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< find function declarations

  /**
   * 
   * @param fn 
   * @description [Self Reference & Import Cycles](https://hybrids.js.org/#/store/model?id=self-reference-amp-import-cycles)
   */
  function ref<T>(fn: () => T): () => T;

  /**
   * 
   * @param value 
   * @description [Record](https://hybrids.js.org/#/store/model?id=record)
   */
  function record<V>(value: V): Record<string, V>;
  function record<V extends () => {}>(value: V): Record<string, ReturnType<V>>;

  interface ValidateFunction<M extends ModelInstance, T> {
    (value: T, key: string, model: M): string | boolean | void;
  }

  /**
   * 
   * @param defaultValue 
   * @param validate 
   * @param errorMessage 
   * @description [Validation](https://hybrids.js.org/#/store/model?id=validation)
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

/**
 * 
 * @param views 
 * @param options 
 * @description [Factory](https://hybrids.js.org/#/router/usage?id=factory)
 */
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

  /**
   * 
   * @param value 
   * @description [_________](___________________________________________________________________)
   */
  function debug(value?: boolean): void;

  type UrlParams<E> = {
    [property in keyof E]?: E[property];
  };

  type UrlOptions = {
    scrollToTop?: boolean;
  };

  /**
   * 
   * @param view 
   * @param params 
   * @description [`router.url()`](https://hybrids.js.org/#/router/usage?id=routerurl)
   */
  function url<E>(
    view: ComponentBase,
    params?: UrlParams<E> & UrlOptions,
  ): URL | "";

  /**
   * 
   * @param options 
   * @description [`router.backUrl()`](https://hybrids.js.org/#/router/usage?id=routerbackurl)
   */
  function backUrl(options?: { nested?: boolean } & UrlOptions): URL | "";
  
  /**
   * 
   * @param params 
   * @description [`router.guardUrl()`](https://hybrids.js.org/#/router/usage?id=routerguardurl)
   */
  function guardUrl(params?: UrlParams<any> & UrlOptions): URL | "";
  
  /**
   * 
   * @param params 
   * @description [`router.currentUrl()`](https://hybrids.js.org/#/router/usage?id=routercurrenturl)
   */
  function currentUrl<E>(params?: UrlParams<E> & UrlOptions): URL | "";

  /**
   * 
   * @param views 
   * @param options 
   * @description [`router.active()`](https://hybrids.js.org/#/router/usage?id=routeractive)
   */
  function active(
    views: ComponentBase | ComponentBase[],
    options?: { stack?: boolean },
  ): boolean;

  /**
   * 
   * @param event 
   * @param promise 
   * @description [`router.resolve()`](https://hybrids.js.org/#/router/usage?id=routerresolve)
   */
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

/**
 * 
 * @param lang 
 * @param messages 
 * @description [Built-in format](https://hybrids.js.org/#/component-model/localization?id=built-in-format)
 */
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

/**
 * 
 * @param parts 
 * @param args 
 * @description [_________](___________________________________________________________________)
 */
export function msg(parts: TemplateStringsArray, ...args: unknown[]): string;

export namespace msg {
  /**
   * 
   * @param parts 
   * @param args 
   * @description [_________](___________________________________________________________________)
   */
  function html<E>(
    parts: TemplateStringsArray,
    ...args: unknown[]
  ): UpdateFunctionWithMethods<E>;

  /**
   * 
   * @param parts 
   * @param args 
   * @description [_________](___________________________________________________________________)
   */
  function svg<E>(
    parts: TemplateStringsArray,
    ...args: unknown[]
  ): UpdateFunctionWithMethods<E>;
}

/* Utils */

/**
 * 
 * @param host 
 * @param eventType 
 * @param options 
 * @description [_________](___________________________________________________________________)
 */
export function dispatch(
  host: EventTarget,
  eventType: string,
  options?: CustomEventInit,
): boolean;

/**
 * @description [_________](___________________________________________________________________)
 */
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

/**
 * 
 * @param parts 
 * @param args 
 * @description [_________](___________________________________________________________________)
 */
export function html<E>(
  parts: TemplateStringsArray,
  ...args: unknown[]
): UpdateFunctionWithMethods<E>;

export namespace html {
  /**
   * 
   * @param property 
   * @param valueOrPath 
   * @description [_________](___________________________________________________________________)
   */
  function set<E>(property: keyof E, valueOrPath?: any): EventHandler<E>;
  function set<E, M>(property: M, valueOrPath: string | null): EventHandler<E>;

  /**
   * 
   * @param promise 
   * @param placeholder 
   * @param delay 
   * @description [_________](___________________________________________________________________)
   */
  function resolve<E>(
    promise: Promise<any>,
    placeholder?: UpdateFunction<E>,
    delay?: number,
  ): UpdateFunction<E>;

  /**
   * 
   * @param template 
   * @description [_________](___________________________________________________________________)
   */
  function transition<E>(template: UpdateFunction<E>): UpdateFunction<E>;

  /**
   * 
   * @param parts 
   * @param args 
   * @description [_________](___________________________________________________________________)
   */
  function msg(parts: TemplateStringsArray, ...args: unknown[]): string;
}

/**
 * 
 * @param parts 
 * @param args 
 * @description [_________](___________________________________________________________________)
 */
export function svg<E>(
  parts: TemplateStringsArray,
  ...args: unknown[]
): UpdateFunctionWithMethods<E>;

export type Property<E, V> =
  | (V extends string | number | boolean | undefined ? V : never)
  | ((host: E & HTMLElement, lastValue: V) => V)
  | Descriptor<E, V>
  | undefined;

export interface Descriptor<E, V> {
  value?: V;
  get?: (host: E & HTMLElement, lastValue: any) => V;
  set?: (host: E & HTMLElement, value: any, lastValue: V) => any;
  connect?(
    host: E & HTMLElement & { __property_key__: V },
    key: "__property_key__",
    invalidate: (options?: { force?: boolean }) => void,
  ): Function | void;
  observe?(host: E & HTMLElement, value: V, lastValue: V): void;
}

export interface UpdateFunction<E> {
  (host: E & HTMLElement, target: ShadowRoot | Text | E): void;
}

export interface RenderFunction<E> {
  (host: E & HTMLElement): UpdateFunction<E>;
}

export type ComponentBase = {
  tag: string;
  __router__connect__?: ViewOptions;
};

export type Component<E> = ComponentBase & {
  [property in Extract<
    keyof Omit<E, keyof HTMLElement>,
    string
  >]: property extends "render" | "content"
    ? E[property] extends () => HTMLElement
      ? RenderFunction<E>
      : Property<E, E[property]>
    : Property<E, E[property]>;
} & {
  render?: RenderFunction<E>;
  content?: RenderFunction<E>;
};

export interface HybridElement<E> {
  new (): E & HTMLElement;
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

export type NestedArrayModel<T> = NonNullable<Unarray<T>> extends
  | string
  | String
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

export type StorageResult<M extends ModelInstance> = StorageValues<M> | null;

export type Storage<M extends ModelInstance> = {
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
  const connect = "__store__connect__";

  function get<M extends ModelInstance>(
    Model: Model<M>,
    id?: ModelIdentifier,
  ): M;
  function get<M extends ModelInstance>(
    Model: [Model<M>],
    id?: ModelIdentifier,
  ): M[];

  function set<M extends ModelInstance>(
    model: Model<M> | M,
    values: ModelValues<M> | null,
  ): Promise<M>;
  function sync<M extends ModelInstance>(
    model: Model<M> | M,
    values: ModelValues<M> | null,
  ): M;
  function clear<M extends ModelInstance>(
    model: Model<M> | [Model<M>] | M,
    clearValue?: boolean,
  ): void;

  function pending<M extends ModelInstance>(model: M): false | Promise<M>;
  function pending<M extends ModelInstance>(
    ...models: Array<M>
  ): false | Promise<typeof models>;

  function error<M extends ModelInstance>(
    model: M,
    propertyName?: keyof M | null,
  ): false | Error | any;

  function ready<M extends ModelInstance>(model: M): boolean;
  function ready<M extends ModelInstance>(...models: Array<M>): boolean;

  function submit<M extends ModelInstance>(
    draft: M,
    values?: ModelValues<M>,
  ): Promise<M>;

  function resolve<M extends ModelInstance>(model: M): Promise<M>;
  function resolve<M extends ModelInstance>(
    model: Model<M>,
    id?: ModelIdentifier,
  ): Promise<M>;

  function ref<T>(fn: () => T): T;

  interface ValidateFunction<M extends ModelInstance, T> {
    (value: T, key: string, model: M): string | boolean | void;
  }

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

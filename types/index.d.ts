declare module "hybrids" {
  type Property<E, V> =
    | (V extends string | number | boolean | undefined ? V : never)
    | ((host: E & HTMLElement, lastValue: V) => V)
    | Descriptor<E, V>
    | undefined;

  interface Descriptor<E, V> {
    value?: V;
    get?: (host: E & HTMLElement, lastValue: any) => V;
    set?: (host: E & HTMLElement, value: any, lastValue: V) => any;
    connect?(
      host: E & HTMLElement & { __property_key__: V; },
      key: "__property_key__",
      invalidate: (options?: { force?: boolean; }) => void,
    ): Function | void;
    observe?(host: E & HTMLElement, value: V, lastValue: V): void;
  }

  interface UpdateFunction<E> {
    (host: E & HTMLElement, target: ShadowRoot | Text | E): void;
  }

  interface RenderFunction<E> {
    (host: E & HTMLElement): UpdateFunction<E>;
  }

  type ComponentBase = {
    tag: string;
    __router__connect__?: ViewOptions;
  };

  type Component<E> = ComponentBase & {
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

  interface HybridElement<E> {
    new(): E & HTMLElement;
    prototype: E & HTMLElement;
  }

  /* Define */

  function define<E>(component: Component<E>): typeof component;

  namespace define {
    function compile<E>(component: Component<E>): HybridElement<E>;

    function from(
      components: { [path: string]: Component<any>; },
      options?: { prefix?: string; root?: string | string[]; },
    ): void;
  }

  /* Mount */
  function mount<E>(target: HTMLElement, component: Component<E>): () => void;

  /* Factories */

  function parent<E, V>(
    componentOrFn: Component<V> | ((component: Component<E>) => boolean),
  ): Descriptor<E, V>;

  function children<E, V>(
    componentOrFn: Component<V> | ((component: Component<E>) => boolean),
    options?: { deep?: boolean; nested?: boolean; },
  ): Descriptor<E, V[]>;

  /* Store */

  type ModelInstance = { id?: string; } & object & NonArrayObject;
  type EnumerableInstance = { id: string; } & object & NonArrayObject;
  type SingletonInstance = { id?: never; } & object & NonArrayObject;

  type Unarray<T> = T extends Array<infer U> ? U : T;
  type NonConstructor = { readonly prototype?: never; };
  type NonArrayObject = { [Symbol.iterator]?: never; } & object;

  type Model<M extends ModelInstance> = NonArrayObject & {
    [property in keyof Omit<M, "id">]-?:
    NonNullable<M[property]> extends Array<any>
    ? NestedArrayModel<NonNullable<M[property]>>
    | NonConstructor & ((model: M) =>
      undefined extends M[property]
      ? undefined | NestedArrayModel<M[property]>
      : NestedArrayModel<M[property]>)

    : NonNullable<M[property]> extends string | String
    ? string
    | NonConstructor & ((model: M) => M[property])

    : NonNullable<M[property]> extends number | Number
    ? number
    | NonConstructor & ((model: M) => M[property])

    : NonNullable<M[property]> extends boolean | Boolean
    ? boolean
    | NonConstructor & ((model: M) => M[property])

    : NonNullable<M[property]> extends ModelInstance
    ? Model<NonNullable<M[property]>>
    | NonConstructor & ((model: M) =>
      undefined extends M[property]
      ? undefined | Model<NonNullable<M[property]>>
      : Model<NonNullable<M[property]>>)

    : NonNullable<M[property]> extends NonArrayObject
    ? NonNullable<M[property]>
    | NonConstructor & ((model: M) => M[property])

    : never;
  } & (M extends EnumerableInstance ? {
    id: true;
  } : {}) & {
    __store__connect__?: Storage<M> | Storage<M>["get"];
  };

  type NestedArrayModel<T> =
    NonNullable<Unarray<T>> extends string | String
    ? T | string[] | [String | StringConstructor]

    : NonNullable<Unarray<T>> extends number | Number
    ? T | number[] | [Number | NumberConstructor]

    : NonNullable<Unarray<T>> extends boolean | Boolean
    ? T | boolean[] | [Boolean | BooleanConstructor]

    : NonNullable<Unarray<T>> extends EnumerableInstance
    ? [Model<NonNullable<Unarray<T>>>] | [Model<NonNullable<Unarray<T>>>, { loose?: boolean; }]

    : NonNullable<Unarray<T>> extends NonArrayObject
    ? T

    : never;

  type ModelIdentifier =
    | string
    | Record<string, string | boolean | number | null>
    | undefined;

  type ModelValues<M> = {
    [property in keyof M]?: M[property] extends object
    ? ModelValues<M[property]>
    : M[property];
  };

  type StorageValues<M> = {
    [property in keyof M]?: M[property] extends object
    ? M[property] | string
    : M[property];
  };

  type StorageResult<M> =
    | StorageValues<M>
    | null
    | Promise<StorageValues<M> | null>;

  type Storage<M> = {
    get?: (id: ModelIdentifier) => StorageResult<M>;
    set?: (
      id: ModelIdentifier,
      values: M | null,
      keys: [keyof M],
    ) => StorageResult<M>;
    list?: (id: ModelIdentifier) => StorageResult<Array<M>>;
    observe?: (
      id: ModelIdentifier,
      model: M | null,
      lastModel: M | null,
    ) => void;
    cache?: boolean | number;
    offline?: boolean | number;
    loose?: boolean;
  };

  // Enumerable - This overload must be the first one, then its signature and documentation will be displayed in intelephence by default.
  function store<E, M extends EnumerableInstance>(
    model: Model<M>,
    options?: { draft?: false; id?: keyof E | ((host: E) => ModelIdentifier); }
  ): Descriptor<E, M | undefined>;

  // Enumerable Draft
  function store<E, M extends EnumerableInstance>(
    model: Model<M>,
    options: { draft: true; id?: keyof E | ((host: E) => ModelIdentifier); }
  ): Descriptor<E, M>;

  // Enumerable Listing
  function store<E, M extends EnumerableInstance>(
    model: [Model<M>],
    options?: { draft?: false; id?: keyof E | ((host: E) => ModelIdentifier); loose?: boolean; }
  ): Descriptor<E, M[]>;

  // Singleton
  function store<E, M extends SingletonInstance>(
    model: M extends Array<any> ? never : Model<M>,
    options?: { draft?: false; id?: keyof E | ((host: E) => ModelIdentifier); }
  ): Descriptor<E, M>;

  // Singleton Draft
  function store<E, M extends SingletonInstance>(
    model: M extends Array<any> ? never : Model<M>,
    options: { draft: true; id?: keyof E | ((host: E) => ModelIdentifier); }
  ): Descriptor<E, M>;

  namespace store {
    const connect = "__store__connect__";

    function get<M extends ModelInstance>(Model: Model<M>, id?: ModelIdentifier): M
    function get<M extends ModelInstance>(Model: [Model<M>], id?: ModelIdentifier): M[]

    function set<M extends ModelInstance>(model: Model<M> | M, values: ModelValues<M> | null): Promise<M>
    function sync<M extends ModelInstance>(model: Model<M> | M, values: ModelValues<M> | null): M
    function clear<M extends ModelInstance>(model: Model<M> | [Model<M>] | M, clearValue?: boolean): void

    function pending<M extends ModelInstance>(model: M): false | Promise<M>
    function pending<M extends ModelInstance>(...models: Array<M>): false | Promise<typeof models>

    function error<M extends ModelInstance>(model: M, propertyName?: keyof M | null): false | Error | any

    function ready<M extends ModelInstance>(model: M): boolean
    function ready<M extends ModelInstance>(...models: Array<M>): boolean

    function submit<M extends ModelInstance>(draft: M, values?: ModelValues<M>): Promise<M>

    function resolve<M extends ModelInstance>(model: M): Promise<M>
    function resolve<M extends ModelInstance>(model: Model<M>, id?: ModelIdentifier): Promise<M>

    function ref<T>(fn: () => T): T

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

  interface ViewOptions<> {
    url?: string;
    multiple?: boolean;
    dialog?: boolean;
    replace?: boolean;
    stack?: ComponentBase[] | (() => ComponentBase[]);
    guard?: () => boolean;
  }

  function router<E>(
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

  namespace router {
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

    function backUrl(options?: { nested?: boolean; } & UrlOptions): URL | "";
    function guardUrl(params?: UrlParams<any> & UrlOptions): URL | "";
    function currentUrl<E>(params?: UrlParams<E> & UrlOptions): URL | "";

    function active(
      views: ComponentBase | ComponentBase[],
      options?: { stack?: boolean; },
    ): boolean;

    function resolve<P>(event: Event, promise: Promise<P>): Promise<P>;
  }

  /* Localize */
  type Messages = {
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

  function localize(lang: string, messages: Messages): void;
  function localize(
    translate: (
      key: string,
      context: string,
    ) => string | ((num: number) => string),
    options?: {
      format?: "chrome.i18n";
    },
  ): void;

  namespace localize {
    const languages: string[];
  }

  function msg(parts: TemplateStringsArray, ...args: unknown[]): string;

  namespace msg {
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

  function dispatch(
    host: EventTarget,
    eventType: string,
    options?: CustomEventInit,
  ): boolean;

  /* Template Engine */

  interface UpdateFunctionWithMethods<E> extends UpdateFunction<E> {
    key: (id: any) => this;
    style: (...styles: Array<string | CSSStyleSheet>) => this;
    css: (parts: TemplateStringsArray, ...args: unknown[]) => this;
    use: (fn: (template: UpdateFunction<E>) => UpdateFunction<E>) => this;
  }

  interface EventHandler<E> {
    (host: E & HTMLElement, event?: Event): any;
  }

  function html<E>(
    parts: TemplateStringsArray,
    ...args: unknown[]
  ): UpdateFunctionWithMethods<E>;

  namespace html {
    function set<E>(property: keyof E, valueOrPath?: any): EventHandler<E>;
    function set<E, M>(
      property: M,
      valueOrPath: string | null,
    ): EventHandler<E>;

    function resolve<E>(
      promise: Promise<any>,
      placeholder?: UpdateFunction<E>,
      delay?: number,
    ): UpdateFunction<E>;

    function transition<E>(template: UpdateFunction<E>): UpdateFunction<E>;

    function msg(parts: TemplateStringsArray, ...args: unknown[]): string;
  }

  function svg<E>(
    parts: TemplateStringsArray,
    ...args: unknown[]
  ): UpdateFunctionWithMethods<E>;
}

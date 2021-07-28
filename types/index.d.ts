declare module "hybrids" {
  interface InvalidateOptions {
    force?: boolean;
  }

  interface Descriptor<E, V> {
    get?(host: E & HTMLElement, lastValue: V | undefined): V;
    set?(host: E & HTMLElement, value: any, lastValue: V | undefined): V;
    connect?(
      host: E & HTMLElement & { __property_key__: V },
      key: "__property_key__",
      invalidate: (options?: InvalidateOptions) => void,
    ): Function | void;
    observe?(host: E & HTMLElement, value: V, lastValue: V): void;
  }

  type DescriptorValue<D> = D extends (...args: any) => any
    ? ReturnType<D> extends Descriptor<any, infer V>
      ? V
      : never
    : D extends Descriptor<any, infer V>
    ? V
    : never;

  type Property<E, V> = V | Descriptor<E, V> | Descriptor<E, V>["get"];

  interface UpdateFunction<E> {
    (host: E & HTMLElement, target: ShadowRoot | Text | E): void;
  }

  interface RenderFunction<E> {
    (host: E & HTMLElement): UpdateFunction<E>;
  }

  type Hybrids<E> = {
    [property in Extract<
      keyof Omit<E, keyof HTMLElement>,
      string
    >]: property extends "render" | "content"
      ? E[property] extends () => HTMLElement
        ? RenderFunction<E>
        : Property<E, E[property]>
      : Property<E, E[property]>;
  } &
    (E extends { tag: any } ? {} : { tag?: string }) & {
      render?: RenderFunction<E> | Descriptor<E, () => HTMLElement>;
      content?: RenderFunction<E> | Descriptor<E, () => HTMLElement>;
    };

  interface MapOfHybrids {
    [tagName: string]: Hybrids<any>;
  }

  type MapOfConstructors<T> = {
    [tagName in keyof T]: T[tagName] extends Hybrids<infer E>
      ? HybridElement<E>
      : typeof HTMLElement;
  };

  interface HybridElement<E> {
    new (): E & HTMLElement;
    prototype: E & HTMLElement;
  }

  /* Define */

  function define<E>(
    tagName: string | null,
    hybrids: Hybrids<E>,
  ): HybridElement<E>;

  type TaggedHybrids<E> = Hybrids<E> & { tag: string };

  function define<E>(hybrids: TaggedHybrids<E>): typeof hybrids;
  function define(listOfHybrids: TaggedHybrids<any>[]): typeof listOfHybrids;

  /* Factories */

  function property<E, V>(
    value: V | null | undefined | ((value: any) => V),
    connect?: Descriptor<E, V>["connect"],
    observe?: Descriptor<E, V>["observe"],
  ): Descriptor<E, V>;

  function parent<E, V>(
    hybridsOrFn: Hybrids<V> | ((hybrids: Hybrids<E>) => boolean),
  ): Descriptor<E, V>;

  function children<E, V>(
    hybridsOrFn: Hybrids<V> | ((hybrids: Hybrids<E>) => boolean),
    options?: { deep?: boolean; nested?: boolean },
  ): Descriptor<E, V>;

  function render<E>(
    fn: RenderFunction<E>,
    customOptions?: { shadowRoot?: boolean | object },
  ): Descriptor<E, () => HTMLElement>;

  /* Store */

  type Model<M> = {
    [property in keyof Omit<M, "id">]: Required<M>[property] extends Array<
      infer T
    >
      ? [Model<T>] | ((model: M) => T[])
      : Required<M>[property] extends object
      ? Model<Required<M>[property]> | ((model: M) => M[property])
      : Required<M>[property] | ((model: M) => M[property]);
  } & {
    id?: true;
    __store__connect__?: Storage<M> | Storage<M>["get"];
  };

  type ModelIdentifier =
    | string
    | Record<string, string | boolean | number | null>
    | undefined;

  type ModelValues<M> = {
    [property in keyof M]?: M[property] extends object
      ? ModelValues<M[property]>
      : M[property];
  };

  type StorageResult<M> = M | null | Promise<M | null>;

  type Storage<M> = {
    get?: (id: ModelIdentifier) => StorageResult<M>;
    set?: (
      id: ModelIdentifier,
      values: M | null,
      keys: [keyof M],
    ) => StorageResult<M>;
    list?: (id: ModelIdentifier) => StorageResult<Array<M>>;
    cache?: boolean | number;
    loose?: boolean;
    offline?: boolean | number;
  };

  type StoreOptions<E> =
    | keyof E
    | ((host: E) => ModelIdentifier)
    | { id?: keyof E | ((host: E) => ModelIdentifier); draft?: boolean };

  function store<E, M>(
    Model: Model<M>,
    options?: StoreOptions<E>,
  ): Descriptor<E, M>;

  namespace store {
    const connect = "__store__connect__";

    function get<M>(Model: Model<M>, id?: ModelIdentifier): M;
    function get<M>(Model: [Model<M>], id?: ModelIdentifier): M[];

    function set<M>(
      model: Model<M> | M,
      values: ModelValues<M> | null,
    ): Promise<M>;
    function sync<M>(model: Model<M> | M, values: ModelValues<M> | null): M;
    function clear<M>(
      model: Model<M> | [Model<M>] | M,
      clearValue?: boolean,
    ): void;

    function pending<M>(model: M): false | Promise<M>;
    function pending(...models: Array<object>): false | Promise<typeof models>;

    function error<M>(model: M, propertyName?: keyof M): false | Error | any;

    function ready<M>(model: M): boolean;
    function ready(...models: Array<object>): boolean;

    function submit<M>(draft: M, values?: ModelValues<M>): Promise<M>;
    function resolve<M>(model: M): Promise<M>;
    function ref<M>(fn: () => M): M;

    interface ValidateFunction<M, T> {
      (value: T, key: string, model: M): string | boolean | void;
    }

    function value<M>(
      defaultValue: string,
      validate?: ValidateFunction<M, string> | RegExp,
      errorMessage?: string,
    ): string;
    function value<M>(
      defaultValue: number,
      validate?: ValidateFunction<M, number> | RegExp,
      errorMessage?: string,
    ): number;
  }

  /* Utils */

  function dispatch(
    host: EventTarget,
    eventType: string,
    options?: CustomEventInit,
  ): boolean;

  /* Template Engine */

  interface UpdateFunctionWithMethods<E> extends UpdateFunction<E> {
    define: (elements: MapOfHybrids) => this;
    key: (id: any) => this;
    style: (...styles: Array<string | CSSStyleSheet>) => this;
    css: (parts: TemplateStringsArray, ...args: unknown[]) => this;
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
  }

  function svg<E>(
    parts: TemplateStringsArray,
    ...args: unknown[]
  ): UpdateFunctionWithMethods<E>;

  namespace svg {
    function set<E>(property: keyof E, valueOrPath?: any): EventHandler<E>;
    function set<E, M>(
      property: Model<M>,
      valueOrPath: string | null,
    ): EventHandler<E>;

    function resolve<E>(
      promise: Promise<any>,
      placeholder?: UpdateFunction<E>,
      delay?: number,
    ): UpdateFunction<E>;
  }
}

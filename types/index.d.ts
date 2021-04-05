// tslint:disable-next-line:export-just-namespace
export = hybrids;
export as namespace hybrids;

declare namespace hybrids {
  interface Descriptor<E, V> {
    get?(host: E & HTMLElement, lastValue: V): V;
    set?(host: E & HTMLElement, value: any, lastValue: V): V;
    connect?<K extends keyof E>(
      host: E & HTMLElement & { [property in K]: V },
      key: K,
      invalidate: Function,
    ): Function | void;
    observe?(host: E & HTMLElement, value: V, lastValue: V): void;
  }

  type DescriptorValue<D> = D extends (...args: any) => any
    ? ReturnType<D> extends Descriptor<infer E, infer V>
      ? V
      : never
    : D extends Descriptor<infer E, infer V>
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
    render?: E extends { render: infer V } ? Property<E, V> : RenderFunction<E>;
    content?: E extends { render: infer V }
      ? Property<E, V>
      : RenderFunction<E>;
  } & {
    [property in keyof Omit<E, keyof HTMLElement>]: Property<E, E[property]>;
  };

  interface MapOfHybrids {
    [tagName: string]: Hybrids<any>;
  }

  type MapOfConstructors<T> = {
    [tagName in keyof T]: typeof HTMLElement;
  };

  interface HybridElement<E> {
    new (): E;
    prototype: E;
  }

  /* Define */

  function define<E>(
    tagName: string | null,
    hybrids: Hybrids<E>,
  ): HybridElement<E & HTMLElement>;
  function define(
    mapOfHybrids: MapOfHybrids,
  ): MapOfConstructors<typeof mapOfHybrids>;

  /* Factories */

  function property<E, V>(
    value: V | null | undefined | ((value: any) => V),
    connect?: Descriptor<E, V>["connect"],
  ): Descriptor<E, V>;
  function parent<E, T>(
    hybridsOrFn: Hybrids<T> | ((hybrids: Hybrids<E>) => boolean),
  ): Descriptor<E, T>;
  function children<E, T>(
    hybridsOrFn: Hybrids<T> | ((hybrids: Hybrids<E>) => boolean),
    options?: { deep?: boolean; nested?: boolean },
  ): Descriptor<E, T>;
  function render<E>(
    fn: RenderFunction<E>,
    customOptions?: { shadowRoot?: boolean | object },
  ): Descriptor<E, Function>;

  /* Store */

  type Model<M> = {
    [property in keyof Omit<M, "id">]: Required<M>[property] extends Array<
      infer T
    >
      ? [Model<T>] | ((model: M) => T[])
      : Required<M>[property] extends Object
      ? Model<Required<M>[property]> | ((model: M) => M[property])
      : Required<M>[property] | ((model: M) => M[property]);
  } & {
    id?: true;
    __store__connect__?: Storage<M> | Storage<M>["get"];
  };

  type ModelIdentifier =
    | string
    | undefined
    | {
        [property: string]: string | boolean | number | null;
      };

  type ModelValues<M> = {
    [property in keyof M]?: M[property] extends Object
      ? ModelValues<M[property]>
      : M[property];
  };

  type StorageResult<M> = M | null | Promise<M | null>;

  type Storage<M> = {
    cache?: boolean | number;
    get?: (id: ModelIdentifier) => StorageResult<M>;
    set?: (
      id: ModelIdentifier,
      values: M | null,
      keys: [keyof M],
    ) => StorageResult<M>;
    list?: (id: ModelIdentifier) => StorageResult<Array<M>>;
  };

  type StoreOptions<E> =
    | keyof E
    | ((host: E) => string)
    | { id?: keyof E; draft: boolean };

  function store<E, M>(
    Model: Model<M>,
    options?: StoreOptions<E>,
  ): Descriptor<E, M>;

  namespace store {
    const connect = "__store__connect__";

    function get<M>(Model: Model<M>, id?: ModelIdentifier): M;
    function set<M>(
      model: Model<M> | M,
      values: ModelValues<M> | null,
    ): Promise<M>;
    function sync<M>(model: Model<M> | M, values: ModelValues<M> | null): M;
    function clear<M>(model: Model<M> | M, clearValue?: boolean): void;

    function pending<M>(model: M): false | Promise<M>;
    function error<M>(model: M, propertyName?: keyof M): false | Error | any;
    function ready<M>(model: M): boolean;

    function submit<M>(draft: M, values?: ModelValues<M>): Promise<M>;
    function resolve<M>(model: M): Promise<M>;
    function ref<M>(fn: () => M): M;

    interface ValidateFunction<M> {
      (value: string | number, key: string, model: M): string | boolean | void;
    }

    function value<M>(
      defaultValue: string,
      validate?: ValidateFunction<M> | RegExp,
      errorMessage?: string,
    ): string;
    function value<M>(
      defaultValue: number,
      validate?: ValidateFunction<M> | RegExp,
      errorMessage?: string,
    ): number;
  }

  /* Router */
  interface RouterOptions<E> {
    url?: string;
    params?: (host: E) => object;
  }

  type View<E> = Hybrids<E> & {
    __router__connect__?: {
      url?: string;
      multiple?: boolean;
      guard?: (host: E) => any;
      stack?: MapOfViews;
    };
  };

  interface MapOfViews {
    [tagName: string]: View<any>;
  }

  function router<E>(
    views: MapOfViews,
    options: RouterOptions<E>,
  ): Descriptor<E, HTMLElement[]>;

  namespace router {
    const connect = "__router__connect__";

    function url<V>(view: V, params?: Record<string, any>): string;
    function backUrl(params?: Record<string, any>): string;
    function guardUrl(params?: Record<string, any>): string;
    function currentUrl(params?: Record<string, any>): string;
    function isActive<V>(...views: V[]): boolean;

    function resolve(event: Event, promise: Promise<any>): void;
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
      promise: Promise<UpdateFunction<E>>,
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
      promise: Promise<UpdateFunction<E>>,
      placeholder?: UpdateFunction<E>,
      delay?: number,
    ): UpdateFunction<E>;
  }
}

// tslint:disable-next-line:export-just-namespace
export = hybrids;
export as namespace hybrids;

declare namespace hybrids {
  interface Descriptor<E extends HTMLElement> {
    get?(host: E, lastValue: any): any;
    set?(host: E, value: any, lastValue: any): any;
    connect?(host: E, key: string, invalidate: Function): Function | void;
    observe?(host: E, value: any, lastValue: any): void;
  }

  type Property<E extends HTMLElement> =
    | string
    | number
    | boolean
    | null
    | undefined
    | any[]
    | Descriptor<E>;

  interface UpdateFunction<E extends HTMLElement> {
    (host: E, target: ShadowRoot | Text | E): void;
  }

  interface RenderFunction<E extends HTMLElement> {
    (host: E) : UpdateFunction<E>;
  }

  type Hybrids<E extends HTMLElement> =
   { render?: RenderFunction<E> | Property<E> }
   & { [property in keyof E]?: Property<E> | Descriptor<E>['get'] }

  interface MapOfHybridsOrConstructors {
    [tagName: string]: Hybrids<any> | typeof HTMLElement,
  }

  type MapOfConstructors<T> = {
    [tagName in keyof T]: typeof HTMLElement;
  }

  interface HybridElement<E extends HTMLElement> {
    new(): E;
    prototype: E;
  }

  /* Define */

  function define<E extends HTMLElement>(tagName: string | null, hybridsOrConstructor: Hybrids<E> | typeof HTMLElement): HybridElement<E>;
  function define(mapOfHybridsOrConstructors: MapOfHybridsOrConstructors): MapOfConstructors<typeof mapOfHybridsOrConstructors>;

  /* Factories */

  function property<E extends HTMLElement>(value: any, connect?: Descriptor<E>['connect']): Descriptor<E>;
  function parent<E extends HTMLElement, T extends HTMLElement>(hybridsOrFn: Hybrids<T> | ((hybrids: Hybrids<E>) => boolean)): Descriptor<E>;
  function children<E extends HTMLElement, T extends HTMLElement>(hybridsOrFn: (Hybrids<T> | ((hybrids: Hybrids<E>) => boolean)), options? : { deep?: boolean, nested?: boolean }): Descriptor<E>;
  function render<E extends HTMLElement>(fn: RenderFunction<E>, customOptions?: { shadowRoot?: boolean | object }): Descriptor<E>;

  /* Store */

  type Model<M> = {
    [property in keyof Omit<M, "id">]: M[property] | ((model: M) => any);
  } & {
    id?: true;
    __store__connect__?: Storage<M>;
  };
  
  type ModelIdentifier = 
    | string 
    | undefined 
    | { 
      [property: string]: 
       | string 
       | boolean 
       | number 
       | null;
    };
  
  type ModelValues<M> = {
    [property in keyof M]?: M[property];
  }

  type StorageResult<M> = M | null;

  type Storage<M> = {
    cache?: boolean | number;
    get: (id?: ModelIdentifier) => StorageResult<M> | Promise<StorageResult<M>>;
    set?: (id: ModelIdentifier, values: ModelValues<M> | null, keys: [keyof M]) => StorageResult<M> | Promise<StorageResult<M>>;
    list?: (id: ModelIdentifier) => StorageResult<M> | Promise<StorageResult<M>>;
  }

  type StoreOptions<E> = 
    | keyof E
    | ((host: E) => string)
    | { id?: keyof E, draft: boolean };

  function store<E extends HTMLElement, M>(Model: Model<M>, options?: StoreOptions<E>): Descriptor<E>;

  namespace store {
    const connect = "__store__connect__";

    function get<M>(Model: Model<M>, id: ModelIdentifier): M;
    function set<M>(model: Model<M> | M, values: ModelValues<M> | null): Promise<M>;
    function clear<M>(model: Model<M> | M, clearValue?: boolean): void;

    function pending<M>(model: M): false | Promise<M>;
    function error<M>(model: M): false | Error | any;
    function ready<M>(model: M): boolean;

    function submit<M>(draft: M): Promise<M>;

    interface ValidateFunction<M> {
      (value: string | number, key: string, model: M): string | boolean | void;
    }

    function value<M>(defaultValue: string, validate?: ValidateFunction<M> | RegExp, errorMessage?: string): string;
    function value<M>(defaultValue: number, validate?: ValidateFunction<M> | RegExp, errorMessage?: string): number;
  }

  /* Utils */

  function dispatch(host: EventTarget, eventType: string, options?: CustomEventInit): boolean;

  /* Template Engine */

  interface UpdateFunctionWithMethods<E extends HTMLElement> extends UpdateFunction<E> {
    define: (elements: MapOfHybridsOrConstructors) => this;
    key: (id: any) => this;
    style: (...styles: Array<string | CSSStyleSheet>) => this;
  }

  interface EventHandler<E extends HTMLElement> {
    (host: E, event?: Event) : any;
  }

  function html<E extends HTMLElement>(parts: TemplateStringsArray, ...args: unknown[]): UpdateFunctionWithMethods<E>;

  namespace html {
    function set<E extends HTMLElement>(property: keyof E, valueOrPath?: any): EventHandler<E>;
    function set<E extends HTMLElement, M>(property: Model<M>, valueOrPath: string | null): EventHandler<E>;

    function resolve<E extends HTMLElement>(promise: Promise<UpdateFunction<E>>, placeholder?: UpdateFunction<E>, delay?: number): UpdateFunction<E>;
  }

  function svg<E extends HTMLElement>(parts: TemplateStringsArray, ...args: unknown[]): UpdateFunctionWithMethods<E>;

  namespace svg {
    function set<E extends HTMLElement>(property: keyof E, valueOrPath?: any): EventHandler<E>;
    function set<E extends HTMLElement, M>(property: Model<M>, valueOrPath: string | null): EventHandler<E>;

    function resolve<E extends HTMLElement>(promise: Promise<UpdateFunction<E>>, placeholder?: UpdateFunction<E>, delay?: number) : UpdateFunction<E>;
  }
}

declare module 'hybrids/esm/cache' {
  import type { Descriptor } from 'hybrids';

  export interface CacheEntry<T extends HTMLElement = HTMLElement> {
      target: T,
      key: keyof T,
      value: T[keyof T],
      contexts: unknown,
      deps: unknown,
      state: number,
      checksum: number,
      observed: boolean
  }

  export function getEntry<T extends HTMLElement>(
    target: CacheEntry<T>,
    key: keyof T
  ): CacheEntry<T>;

  export function getEntries<T extends HTMLElement>(target: CacheEntry<T>): CacheEntry<T>[];

  export function get<T extends HTMLElement>(
    target: T,
    key: keyof T,
    getter: Descriptor<T>['get'],
    validate?: <V>(value: V) => boolean
  ): T[keyof T];

  export function set<T extends HTMLElement>(
    target: T,
    key: keyof T,
    setter: Descriptor<T>['set'],
    validate?: <V>(value: V) => boolean
  ): T[keyof T];

  export function invalidate<T extends HTMLElement>(
    target: T,
    key: keyof T,
    clearValue: (...args: any[]) => void,
    deleteValue: (...args: any[]) => void,
  ): void

  export function invalidateAll<T extends HTMLElement>(
    target: T,
    key: keyof T,
    clearValue: (...args: any[]) => void,
    deleteValue: (...args: any[]) => void,
  ): void

  export function observe<T extends HTMLElement>(
    target: T,
    key: keyof T,
    getter: (key: keyof T) => T[keyof T],
    fn: (...args: any[]) => void
  ): () => void
}

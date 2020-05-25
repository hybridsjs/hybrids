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

  function define<E extends HTMLElement>(tagName: string, hybridsOrConstructor: Hybrids<E> | typeof HTMLElement): HybridElement<E>;
  function define(mapOfHybridsOrConstructors: MapOfHybridsOrConstructors): MapOfConstructors<typeof mapOfHybridsOrConstructors>;

  /* Factories */

  function property<E extends HTMLElement>(value: any, connect?: Descriptor<E>['connect']): Descriptor<E>;
  function parent<E extends HTMLElement, T extends HTMLElement>(hybridsOrFn: Hybrids<T> | ((hybrids: Hybrids<E>) => boolean)): Descriptor<E>;
  function children<E extends HTMLElement, T extends HTMLElement>(hybridsOrFn: (Hybrids<T> | ((hybrids: Hybrids<E>) => boolean)), options? : { deep?: boolean, nested?: boolean }): Descriptor<E>;
  function render<E extends HTMLElement>(fn: RenderFunction<E>, customOptions?: { shadowRoot?: boolean | object }): Descriptor<E>;

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

  namespace html {
    function set<E extends HTMLElement>(propertyName: keyof E, value?: any): EventHandler<E>;
    function resolve<E extends HTMLElement>(promise: Promise<UpdateFunction<E>>, placeholder?: UpdateFunction<E>, delay?: number): UpdateFunction<E>;
  }

  function html<E extends HTMLElement>(parts: TemplateStringsArray, ...args: unknown[]): UpdateFunctionWithMethods<E>;

  namespace svg {
    function set<E extends HTMLElement>(propertyName: keyof E, value?: any): EventHandler<E>;
    function resolve<E extends HTMLElement>(promise: Promise<UpdateFunction<E>>, placeholder?: UpdateFunction<E>, delay?: number) : UpdateFunction<E>;
  }

  function svg<E extends HTMLElement>(parts: TemplateStringsArray, ...args: unknown[]): UpdateFunctionWithMethods<E>;
}
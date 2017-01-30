import { define, CONTROLLER, OPTIONS, NAME } from '../src/index';
import Hybrid from '../src/hybrid';

describe('Core | define -', () => {
  describe('basic features', () => {
    const options = {};

    class Controller {
      static get options() { return options; }
    }

    it('return extended Hybrid', () => {
      const ExtHybrid = define('hybrids-core-return-test', class {});
      expect(ExtHybrid.prototype instanceof Hybrid).toEqual(true);
    });

    it('return the same hybrid', () => {
      const one = define('hybrids-core-match', Controller);
      const two = define('hybrids-core-match', Controller);
      expect(one).toEqual(two);
    });

    it('throw for re-define', () => {
      define('hybrids-core-duplicate', Controller);
      expect(() => define('hybrids-core-duplicate', class {})).toThrow();
    });

    it('throw for no arguments', () => {
      expect(() => define()).toThrow();
    });

    it('throw for invalid arguments', () => {
      expect(() => define(class {})).toThrow();
    });

    it('set Hybrid options', () => {
      const ExtHybrid = define('hybrids-core-options', Controller);
      expect(ExtHybrid[OPTIONS]).toEqual(options);
    });

    it('set Hybrid name', () => {
      const ExtHybrid = define('hybrids-core-name', Controller);
      expect(ExtHybrid[NAME]).toEqual('hybrids-core-name');
    });

    it('throw for already defined properties in HTMLElement', () => {
      expect(() => {
        define('hybrids-core-defined-property', class {
          static get options() {
            return { properties: ['title'] };
          }
        });
      }).toThrow();
    });

    it('map public property with controller prototype method', () => {
      const spy = jasmine.createSpy();
      const ExtHybrid = define('hybrids-core-proto-method', class {
        static get options() { return { properties: ['one', 'two'] }; }
        one(...args) { spy.apply(this, args); }
        get two() { return 'value'; }
      });

      const args = [1, 2];
      const hybrid = new ExtHybrid();
      hybrid.one(...args);

      expect(typeof hybrid.two).not.toEqual('function');
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.mostRecent().object).toEqual(hybrid[CONTROLLER]);
      expect(spy.calls.mostRecent().args).toEqual([1, 2]);
    });

    it('map public property with controller own property', () => {
      const ExtHybrid = define('hybrids-core-proto-property', class {
        static get options() {
          return {
            properties: [{ property: 'one', attr: false }, { property: 'two', attr: false }]
          };
        }
        constructor() {
          this.one = 'value';
          this.two = undefined;
        }
      });

      const hybrid = new ExtHybrid();
      expect(hybrid.one).toEqual('value');
      expect(hybrid.two).toEqual(undefined);

      hybrid.one = 'new value';
      hybrid.two = 'other value';

      expect(hybrid[CONTROLLER].one).toEqual('new value');
      expect(hybrid[CONTROLLER].two).toEqual('other value');
    });
  });

  describe('decorator feature', () => {
    it('returns function with name wrapped', () => {
      const decorator = define('hybrids-core-decorator');
      class Controller {}
      const DecoratedController = decorator(Controller);
      expect(DecoratedController).toEqual(Controller);
    });
  });

  describe('providers -', () => {
    let providers;
    let Controller;

    beforeAll(() => {
      providers = [];
      Controller = class {
        static get options() {
          return { providers };
        }
      };
    });

    beforeEach(() => {
      providers.length = 0;
    });

    it('should call provider when define', () => {
      const spy = jasmine.createSpy('provider');
      providers.push(spy);

      const ExtHybrid = define('hybrids-core-providers-one', Controller);
      expect(spy).toHaveBeenCalled();
      expect(spy.calls.mostRecent().args[0])
        .toEqual(jasmine.objectContaining(ExtHybrid[OPTIONS]));
      expect(spy.calls.mostRecent().args[1])
        .toEqual(ExtHybrid[CONTROLLER]);
    });

    it('throw when provider is not a function', () => {
      providers.push({});
      expect(() => define('hybrids-core-providers-two', Controller)).toThrow();
    });
  });

  describe('nested elements by define', () => {
    const test = {};
    class HybridsNestedOne {
      static get options() {
        return {
          properties: ['value']
        };
      }

      constructor() {
        this.value = test;
      }
    }

    class HybridsNestedTwo {
      static get options() {
        return {
          define: { HybridsNestedOne },
          properties: ['value']
        };
      }

      constructor() {
        this.value = test;
      }
    }

    beforeAll(() => {
      define({ HybridsNestedTwo });
    });


    it('define inside options', () => {
      expect(window.customElements.get('hybrids-nested-one')[CONTROLLER]).toEqual(HybridsNestedOne);
      expect(window.customElements.get('hybrids-nested-two')[CONTROLLER]).toEqual(HybridsNestedTwo);
    });

    it('throw when define is not an object', () => {
      expect(() => define('hybrids-core-nested-define-throw', class {
        static get options() { return { define: class {} }; }
      })).toThrow();
    });
  });
});

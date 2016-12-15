import { define, CONTROLLER } from '../src/index';
import Hybrid from '../src/hybrid';

describe('Core | define -', () => {
  describe('return value', () => {
    class Controller {}

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
  });

  describe('decorator feature', () => {
    it('returns function with name wrapped', () => {
      const decorator = define('hybrids-core-decorator');
      class Controller {}
      const DecoratedController = decorator(Controller);
      expect(DecoratedController).toEqual(Controller);
    });
  });

  describe('providers', () => {
    let providers;
    let Controller;

    beforeAll(() => {
      providers = [];
      Controller = class {
        static get options() {
          return { use: providers };
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
      expect(spy.calls.mostRecent().args[0]).toEqual(ExtHybrid);
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

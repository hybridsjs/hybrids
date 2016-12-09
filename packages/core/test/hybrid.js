import { define, CONTROLLER } from '../src/index';

describe('Core | Hybrid - ', () => {
  describe('calls controller', () => {
    let el;
    let ctrl;
    let Controller;

    beforeAll(() => {
      Controller = class {
        static get options() {
          return {
            properties: ['test'],
          };
        }

        constructor() {
          this.test = 'test';
          this.internal = 'test';
        }
      };

      define('hybrids-core-test', Controller);
    });

    beforeEach(() => {
      el = document.createElement('hybrids-core-test');
      ctrl = el[CONTROLLER];
    });

    describe('constructor', () => {
      it('initialize controller', () => {
        expect(ctrl instanceof Controller).toEqual(true);
      });

      it('set public property', () => {
        expect(el.test).toEqual('test');
      });
    });

    describe('connected', () => {
      beforeEach(() => {
        document.body.appendChild(el);
      });

      afterEach(() => {
        document.body.removeChild(el);
      });

      it('maps public property with controller', () => {
        el.test = 'new value';
        expect(ctrl.test).toEqual('new value');
      });

      it('map controller property with element', () => {
        ctrl.test = 'new value';
        expect(el.test).toEqual('new value');
      });

      rafIt('dispatch change event when public property has changed', () => {
        const spy = jasmine.createSpy('callback');
        el.addEventListener('change', spy);
        el.test = 'new value';
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
        });
      });

      rafIt('dispatch change event when controller property has changed', () => {
        const spy = jasmine.createSpy('callback');
        el.addEventListener('change', spy);
        ctrl.test = 'new value';
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
        });
      });

      rafIt('does not dispatch change event when controller internal property has changed', () => {
        const spy = jasmine.createSpy('callback');
        el.addEventListener('change', spy);
        ctrl.internal = 'new value';
        requestAnimationFrame(() => {
          expect(spy).not.toHaveBeenCalled();
        });
      });

      it('dispatch change event in parent', (done) => {
        const testProperty = {};
        let child;
        const spy = jasmine.createSpy('callback');

        class ShadowProvider {
          constructor(element) {
            this.element = element;
          }
          connected() {
            const shadow = this.element.attachShadow({ mode: 'open' });
            child = document.createElement('hybrid-nested-controller');
            shadow.appendChild(child);
          }
        }

        class HybridNestedController {
          static get options() { return { properties: ['test'] }; }
          constructor() {
            this.test = testProperty;
          }
        }

        class HybridShadowController {
          static get options() {
            return {
              define: { HybridNestedController },
              use: [() => host => new ShadowProvider(host)],
              properties: ['test'],
            };
          }

          constructor() {
            this.test = testProperty;
          }
        }

        define({ HybridShadowController });
        const parent = document.createElement('hybrid-shadow-controller');
        document.body.appendChild(parent);

        parent.addEventListener('change', spy);

        requestAnimationFrame(() => {
          child.test.value = 'test';

          requestAnimationFrame(() => {
            expect(spy).toHaveBeenCalled();
            document.body.removeChild(parent);
            done();
          });
        });
      });
    });
  });
});

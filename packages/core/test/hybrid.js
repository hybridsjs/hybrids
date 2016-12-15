import { define, CONTROLLER } from '../src/index';

describe('Core | Hybrid -', () => {
  let el;
  let spy;
  let Controller;

  afterEach(() => {
    if (el && el.parentElement) el.parentElement.removeChild(el);
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      spy = jasmine.createSpy('callback');
      Controller = class {};
    });

    it('initialize controller', () => {
      el = new (define('hybrids-core-hybrid-init', Controller))();
      expect(el[CONTROLLER] instanceof Controller).toEqual(true);
    });

    rafIt('call controller connected', () => {
      define('hybrids-core-hybrid-connected', class {
        connected() { spy(); }
      });
      el = document.createElement('hybrids-core-hybrid-connected');
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalled();
      });
    });

    it('call controller changed', (done) => {
      define('hybrids-core-hybrid-changed', class {
        static get options() { return { properties: ['test'] }; }
        constructor() { this.test = 'value'; }
        changed(...args) { spy(...args); }
      });
      el = document.createElement('hybrids-core-hybrid-changed');
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.test = 'new value';
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
          done();
        });
      });
    });

    it('call controller disconnected', (done) => {
      define('hybrids-core-hybrid-disconnected', class {
        disconnected(...args) { spy(...args); }
      });
      el = document.createElement('hybrids-core-hybrid-disconnected');
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        document.body.removeChild(el);
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
          done();
        });
      });
    });

    // Custom Elements polyfill does not support adoptedCallback
    xit('call controller adopted', (done) => {
      const newDoc = document.implementation.createHTMLDocument('new doc');
      define('hybrids-core-hybrid-adopted', class {
        adopted(...args) { spy(...args); }
      });
      el = document.createElement('hybrids-core-hybrid-adopted');
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        newDoc.body.appendChild(el);
        setTimeout(() => {
          expect(spy).toHaveBeenCalled();
          done();
        }, 1000);
      });
    });

    rafIt('call provider connected', () => {
      define('hybrids-core-hybrid-connected-provider', class {
        static get options() {
          return { use: [() => () => ({ connected() { spy(); } })] };
        }
      });
      el = document.createElement('hybrids-core-hybrid-connected-provider');
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalled();
      });
    });

    it('call provider changed', (done) => {
      define('hybrids-core-hybrid-changed-provider', class {
        static get options() {
          return { use: [() => () => ({ changed() { spy(); } })], properties: ['test'] };
        }
        constructor() { this.test = 'value'; }
      });
      el = document.createElement('hybrids-core-hybrid-changed-provider');
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.test = 'new value';
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
          done();
        });
      });
    });

    it('call provider disconnected', (done) => {
      define('hybrids-core-hybrid-disconnected-provider', class {
        static get options() {
          return { use: [() => () => ({ disconnected() { spy(); } })] };
        }
      });
      el = document.createElement('hybrids-core-hybrid-disconnected-provider');
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        document.body.removeChild(el);
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
          done();
        });
      });
    });

    // Custom Elements polyfill does not support adoptedCallback
    xit('call provider adopted', (done) => {
      const newDoc = document.implementation.createHTMLDocument('new doc');
      define('hybrids-core-hybrid-adopted-provider', class {
        static get options() {
          return { use: [() => () => ({ adopted() { spy(); } })] };
        }
      });

      el = document.createElement('hybrids-core-hybrid-adopted-provider');
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        newDoc.body.appendChild(el);
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
          done();
        });
      });
    });

    describe('change event', () => {
      beforeAll(() => {
        define('hybrids-core-change-event', class {
          static get options() {
            return { properties: ['test'] };
          }
          constructor() {
            this.test = 'test';
          }
        });
      });

      beforeEach(() => {
        el = document.createElement('hybrids-core-change-event');
        document.body.appendChild(el);
      });

      afterEach(() => {
        document.body.removeChild(el);
      });

      rafIt('dispatch when public property has changed', () => {
        el.addEventListener('change', spy);
        el.test = 'new value';
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
        });
      });

      rafIt('dispatch change event when controller property has changed', () => {
        el.addEventListener('change', spy);
        el[CONTROLLER].test = 'new value';
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
        });
      });

      rafIt('does not dispatch when controller internal property has changed', () => {
        el.addEventListener('change', spy);
        el[CONTROLLER].internal = 'new value';
        requestAnimationFrame(() => {
          expect(spy).not.toHaveBeenCalled();
        });
      });

      it('dispatch in parent', (done) => {
        const testProperty = {};
        let child;

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

  describe('public properties', () => {
    let options;

    beforeAll(() => {
      options = {};
      Controller = class {
        static get options() {
          return options;
        }

        constructor() {
          this.one = false;
          this.two = 'test';
        }

        three() { return 'some value'; }

        get four() { return 'other value'; }
      };
    });

    beforeEach(() => {
      options.properties = ['one', { property: 'two', attr: false }, { property: 'three' }, 'four'];
    });

    it('map properties', () => {
      el = new (define('hybrids-core-public-properties', Controller))();
      expect(el.one).toEqual(false);
      expect(el.two).toEqual('test');
      expect(el.three()).toEqual('some value');
      expect(el.four).toEqual('other value');
    });

    it('throw when not defined', () => {
      options.properties.push('five');
      expect(() =>
        new (define('hybrids-core-public-props-error-not-defined', Controller))()
      ).toThrow();
    });

    it('throw for bad type', () => {
      options.properties.push(1);
      expect(() => {
        define('hybrids-core-public-props-error-bad-type', Controller);
      }).toThrow();
    });

    it('throw for already defined property in HTMLElement', () => {
      options.properties.push('title');
      expect(() => define('hybrids-core-public-throw-duplicate', Controller)).toThrow();
    });

    it('reflect boolean value', () => {
      el = new (define('hybrids-core-reflect-boolean', Controller))();
      expect(el.hasAttribute('one')).toEqual(false);
      el.one = true;
      expect(el.hasAttribute('one')).toEqual(true);
      el.one = false;
      expect(el.hasAttribute('one')).toEqual(false);
    });

    rafIt('reinitialize property when element is upgraded', () => {
      el = document.createElement('hybrids-core-public-upgrade');
      el.one = true;

      document.body.appendChild(el);
      define('hybrids-core-public-upgrade', Controller);

      requestAnimationFrame(() => {
        expect({}.hasOwnProperty.call(el, 'one')).toEqual(false);
        expect(el[CONTROLLER].one).toEqual(true);
      });
    });
  });
});

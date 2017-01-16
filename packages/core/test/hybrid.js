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

    it('return string representation', () => {
      el = new (define('hybrids-core-string-id', Controller))();
      expect(el.toString()).toEqual('[object HTMLHybridElement]');
    });

    it('initialize controller', () => {
      el = new (define('hybrids-core-hybrid-init', Controller))();
      expect(el[CONTROLLER] instanceof Controller).toEqual(true);
    });

    rafIt('call controller connect', () => {
      define('hybrids-core-hybrid-connect', class {
        connect() { spy(); }
      });
      el = document.createElement('hybrids-core-hybrid-connect');
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalled();
      });
    });

    it('call controller disconnect', (done) => {
      define('hybrids-core-hybrid-disconnect', class {
        disconnect(...args) { spy(...args); }
      });
      el = document.createElement('hybrids-core-hybrid-disconnect');
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        document.body.removeChild(el);
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
          done();
        });
      });
    });

    rafIt('dispatch hybrid-connect event', () => {
      define('hybrids-core-hybrid-connect-provider', class {
        static get options() {
          return {
            providers: [() => function provider(host) {
              host.addEventListener('hybrid-connect', spy);
            }],
          };
        }
      });
      el = document.createElement('hybrids-core-hybrid-connect-provider');
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalled();
      });
    });

    it('dispatch hybrid-disconnect event', (done) => {
      define('hybrids-core-hybrid-disconnect-provider', class {
        static get options() {
          return {
            providers: [() => function provider(host) {
              host.addEventListener('hybrid-disconnect', spy);
            }],
          };
        }
      });
      el = document.createElement('hybrids-core-hybrid-disconnect-provider');
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        document.body.removeChild(el);
        requestAnimationFrame(() => {
          expect(spy).toHaveBeenCalled();
          done();
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

    rafIt('update attribute from upgraded element', () => {
      el = document.createElement('hybrids-core-reflect-boolean-one');
      el.setAttribute('one', '');

      define('hybrids-core-reflect-boolean-one', Controller);

      document.body.appendChild(el);

      requestAnimationFrame(() => {
        expect(el.one).toEqual(true);
      });
    });

    rafIt('update attribute from defined element', () => {
      define('hybrids-core-reflect-boolean-two', Controller);

      el = document.createElement('hybrids-core-reflect-boolean-two');
      el.setAttribute('one', '');

      document.body.appendChild(el);

      requestAnimationFrame(() => {
        expect(el.one).toEqual(true);
      });
    });

    rafIt('update property from upgraded element', () => {
      el = document.createElement('hybrids-core-reflect-boolean-three');
      el.one = true;

      define('hybrids-core-reflect-boolean-three', Controller);

      document.body.appendChild(el);

      requestAnimationFrame(() => {
        expect(el.hasAttribute('one')).toEqual(true);
        expect(el[CONTROLLER].one).toEqual(true);
      });
    });

    rafIt('reflect boolean value with ctrl', () => {
      define('hybrids-core-reflect-boolean-ctrl', Controller);
      el = document.createElement('hybrids-core-reflect-boolean-ctrl');
      document.body.appendChild(el);

      expect(el.hasAttribute('one')).toEqual(false);
      el[CONTROLLER].one = true;
      requestAnimationFrame(() => {
        expect(el.hasAttribute('one')).toEqual(true);
      });
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

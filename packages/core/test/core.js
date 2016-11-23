import { define, CONTROLLER } from '../src/index';

describe('define', () => {
  let el;
  let ctrl;

  class Controller {
    static get options() {
      return {
        properties: ['test'],
      };
    }

    constructor() {
      this.test = 'test';
      this.internal = 'test';
    }
  }

  define('hybrids-core-test', Controller);

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

    it('maps controller property with element', () => {
      ctrl.test = 'new value';
      expect(el.test).toEqual('new value');
    });

    it('dispatch change event when public property has changed', (done) => {
      const spy = jasmine.createSpy('callback');
      el.addEventListener('change', spy);
      el.test = 'new value';
      window.requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });

    it('dispatch change event when controller property has changed', (done) => {
      const spy = jasmine.createSpy('callback');
      el.addEventListener('change', spy);
      ctrl.test = 'new value';
      window.requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });

    it('does not dispatch change event when controller internal property has changed', (done) => {
      const spy = jasmine.createSpy('callback');
      el.addEventListener('change', spy);
      ctrl.internal = 'new value';
      window.requestAnimationFrame(() => {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
    });

    it('dispatch change event for shadowRoot', (done) => {
      const shadow = el.attachShadow({ mode: 'open' });
      const spy = jasmine.createSpy('callback');
      shadow.addEventListener('change', spy);
      ctrl.internal = 'new value';

      window.requestAnimationFrame(() => {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });
  });
});

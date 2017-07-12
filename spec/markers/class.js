describe('Marker Class', () => {
  test(class {
    static component = {
      template: `
        <div id="simple" class:="one: keys.one; two: keys.two"></div>
        <div id="keys" class:="keys"></div>
        <div id="array" class:="array"></div>
      `,
    };

    constructor() {
      this.keys = {
        one: true,
        two: false,
        three: true,
      };
      this.array = ['one', 'two'];
    }
  }, {
    'sets simple': (el) => {
      expect(getElement(el, 'simple').classList.contains('one')).toEqual(true);
      expect(getElement(el, 'simple').classList.contains('two')).toEqual(false);
    },
    'updates simple': (el, component) => {
      delete component.keys.one;
      component.keys.two = true;
      component.keys.three = false;

      const simple = getElement(el, 'simple');
      return (done) => {
        expect(simple.classList.contains('one')).toEqual(false);
        expect(simple.classList.contains('two')).toEqual(true);
        expect(simple.classList.contains('three')).toEqual(false);

        done();
      };
    },
    'sets keys': (el) => {
      const keys = getElement(el, 'keys');
      expect(keys.classList.contains('one')).toEqual(true);
      expect(keys.classList.contains('two')).toEqual(false);
    },
    'updates keys': (el, component) => {
      delete component.keys.one;
      component.keys.two = true;
      component.keys.three = true;
      const keys = getElement(el, 'keys');
      return (done) => {
        expect(keys.classList.contains('one')).toEqual(false);
        expect(keys.classList.contains('two')).toEqual(true);
        expect(keys.classList.contains('three')).toEqual(true);
        done();
      };
    },
    'clears keys': (el, component) => {
      component.keys = null;
      const keys = getElement(el, 'keys');
      return (done) => {
        expect(keys.classList.contains('one')).toEqual(false);
        expect(keys.classList.contains('two')).toEqual(false);
        expect(keys.classList.contains('three')).toEqual(false);
        done();
      };
    },
    'sets array': (el) => {
      const keys = getElement(el, 'array');
      expect(keys.classList.contains('one')).toEqual(true);
      expect(keys.classList.contains('two')).toEqual(true);
    },
    'removes item in array': (el, component) => {
      component.array.splice(1, 1);

      return (done) => {
        const array = getElement(el, 'array');
        expect(array.classList.contains('one')).toEqual(true);
        expect(array.classList.contains('two')).toEqual(false);
        done();
      };
    },
    'sets item in array': (el, component) => {
      component.array[0] = 'new-value';

      return (done) => {
        const array = getElement(el, 'array');
        expect(array.classList.contains('new-value')).toEqual(true);
        expect(array.classList.contains('one')).toEqual(false);
        done();
      };
    },
    'adds item in array': (el, component) => {
      component.array.push('new-value');

      return (done) => {
        const array = getElement(el, 'array');
        expect(array.classList.contains('one')).toEqual(true);
        expect(array.classList.contains('two')).toEqual(true);
        expect(array.classList.contains('new-value')).toEqual(true);
        done();
      };
    },
    'clears array': (el, component) => {
      component.array = 0;
      return (done) => {
        const array = getElement(el, 'array');
        expect(array.classList.contains('one')).toEqual(false);
        expect(array.classList.contains('two')).toEqual(false);
        done();
      };
    },
  });
});

describe('Marker Class:', () => {
  const test = hybrid(class {
    static view = {
      template: `
        <div id="simple" class:="one: store.keys.one; two: store.keys.two"></div>
        <div id="keys" class:="store.keys"></div>
        <div id="array" class:="store.array"></div>
      `,
    };

    constructor() {
      this.store = {
        keys: {
          one: true,
          two: false,
          three: true,
        },
        array: ['one', 'two'],
      };
    }
  });

  it('sets simple', test(({ getElement }) => {
    expect(getElement('simple').classList.contains('one')).toEqual(true);
    expect(getElement('simple').classList.contains('two')).toEqual(false);
  }));

  it('updates simple', test(({ component, getElement }) => {
    delete component.store.keys.one;
    component.store.keys.two = true;
    component.store.keys.three = false;

    const simple = getElement('simple');
    return (done) => {
      expect(simple.classList.contains('one')).toEqual(false);
      expect(simple.classList.contains('two')).toEqual(true);
      expect(simple.classList.contains('three')).toEqual(false);

      done();
    };
  }));

  it('sets keys', test(({ getElement }) => {
    const keys = getElement('keys');
    expect(keys.classList.contains('one')).toEqual(true);
    expect(keys.classList.contains('two')).toEqual(false);
  }));

  it('updates keys', test(({ component, getElement }) => {
    delete component.store.keys.one;
    component.store.keys.two = true;
    component.store.keys.three = true;
    const keys = getElement('keys');
    return (done) => {
      expect(keys.classList.contains('one')).toEqual(false);
      expect(keys.classList.contains('two')).toEqual(true);
      expect(keys.classList.contains('three')).toEqual(true);
      done();
    };
  }));

  it('clears keys', test(({ component, getElement }) => {
    component.store.keys = null;
    const keys = getElement('keys');
    return (done) => {
      expect(keys.classList.contains('one')).toEqual(false);
      expect(keys.classList.contains('two')).toEqual(false);
      expect(keys.classList.contains('three')).toEqual(false);
      done();
    };
  }));

  it('sets array', test(({ getElement }) => {
    const keys = getElement('array');
    expect(keys.classList.contains('one')).toEqual(true);
    expect(keys.classList.contains('two')).toEqual(true);
  }));

  it('removes item in array', test(({ component, getElement }) => {
    component.store.array.splice(1, 1);

    return (done) => {
      const array = getElement('array');
      expect(array.classList.contains('one')).toEqual(true);
      expect(array.classList.contains('two')).toEqual(false);
      done();
    };
  }));

  it('sets item in array', test(({ component, getElement }) => {
    component.store.array[0] = 'new-value';

    return (done) => {
      const array = getElement('array');
      expect(array.classList.contains('new-value')).toEqual(true);
      expect(array.classList.contains('one')).toEqual(false);
      done();
    };
  }));

  it('adds item in array', test(({ component, getElement }) => {
    component.store.array.push('new-value');

    return (done) => {
      const array = getElement('array');
      expect(array.classList.contains('one')).toEqual(true);
      expect(array.classList.contains('two')).toEqual(true);
      expect(array.classList.contains('new-value')).toEqual(true);
      done();
    };
  }));

  it('clears array', test(({ component, getElement }) => {
    component.store.array = 0;
    return (done) => {
      const array = getElement('array');
      expect(array.classList.contains('one')).toEqual(false);
      expect(array.classList.contains('two')).toEqual(false);
      done();
    };
  }));
});

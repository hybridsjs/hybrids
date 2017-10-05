describe('Marker Attr:', () => {
  const test = hybrid(class {
    static view = {
      template: `
        <div id="one" attr:custom-attr="data.text"></div>
        <div id="two" attr:="with-dash: data.number"></div>
        <div id="three" attr:="OTHER: data.bool"></div>
      `,
    }

    constructor() {
      this.data = { text: 'text', number: 123, bool: true };
    }
  });

  it('sets text to attribute', test(({ getElement }) => {
    expect(getElement('one').getAttribute('customattr')).toEqual('text');
  }));

  it('sets number to attribute', test(({ getElement }) => {
    expect(getElement('two').getAttribute('with-dash')).toEqual('123');
  }));

  it('sets bool to attribute', test(({ getElement }) => {
    expect(getElement('three').hasAttribute('other')).toEqual(true);
    expect(getElement('three').getAttribute('other')).toEqual('');
  }));

  it('removes attribute when false', test(({ component, getElement }) => {
    component.data.bool = false;

    return (done) => {
      expect(getElement('three').hasAttribute('other')).toEqual(false);
      done();
    };
  }));
});

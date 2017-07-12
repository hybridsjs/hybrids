describe('Marker Attr:', () => {
  test(class {
    static component = {
      template: `
        <div id="one" attr:custom-attr="data.text"></div>
        <div id="two" attr:="with-dash: data.number"></div>
        <div id="three" attr:="OTHER: data.bool"></div>
      `,
    }

    constructor() {
      this.data = { text: 'text', number: 123, bool: true };
    }
  }, {
    'sets text to attribute': (el) => {
      expect(getElement(el, 'one').getAttribute('customattr')).toEqual('text');
    },
    'sets number to attribute': (el) => {
      expect(getElement(el, 'two').getAttribute('with-dash')).toEqual('123');
    },
    'sets bool to attribute': (el) => {
      expect(getElement(el, 'three').hasAttribute('other')).toEqual(true);
      expect(getElement(el, 'three').getAttribute('other')).toEqual('');
    },
    'removes attribute when false': (el, component) => {
      component.data.bool = false;

      return (done) => {
        expect(getElement(el, 'three').hasAttribute('other')).toEqual(false);
        done();
      };
    },
  });
});

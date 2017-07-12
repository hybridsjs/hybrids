describe('Style Marker', () => {
  function getComputedStyle(el, id) {
    return global.getComputedStyle(getElement(el, id));
  }

  test(class {
    static component = {
      template: `
        <div id="simple" style:="background-color: style.backgroundColor; color: style.color"></div>
        <div id="list" style:="style"></div>
      `,
    }

    constructor() {
      this.style = {
        backgroundColor: 'rgb(255, 0, 0)',
        color: 'rgb(255, 255, 0)',
      };
    }
  }, {
    'sets simple': (el) => {
      const style = getComputedStyle(el, 'simple');
      expect(style.backgroundColor).toEqual('rgb(255, 0, 0)');
      expect(style.color).toEqual('rgb(255, 255, 0)');
    },
    'updates simple': (el, component) => {
      component.style.backgroundColor = 'rgb(0, 0, 255)';
      delete component.style.color;
      return (done) => {
        const style = getComputedStyle(el, 'simple');
        expect(style.backgroundColor).toEqual('rgb(0, 0, 255)');
        expect(style.color).toEqual('rgb(0, 0, 0)');
        done();
      };
    },
    'sets list': (el) => {
      const style = getComputedStyle(el, 'list');
      expect(style.backgroundColor).toEqual('rgb(255, 0, 0)');
      expect(style.color).toEqual('rgb(255, 255, 0)');
    },
    'updates list': (el, component) => {
      component.style.backgroundColor = 'rgb(0, 0, 255)';
      delete component.style.color;

      return (done) => {
        const style = getComputedStyle(el, 'list');
        expect(style.backgroundColor).toEqual('rgb(0, 0, 255)');
        expect(style.color).toEqual('rgb(0, 0, 0)');
        done();
      };
    },
    'clears list': (el, component) => {
      component.style = null;

      return (done) => {
        expect(!!getElement(el, 'list').getAttribute('style')).toEqual(false);
        done();
      };
    },
  });
});

describe('Style Marker:', () => {
  const test = hybrid(class {
    static view = {
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
  });

  it('sets simple', test(({ getElement }) => {
    const style = global.getComputedStyle(getElement('simple'));
    expect(style.backgroundColor).toEqual('rgb(255, 0, 0)');
    expect(style.color).toEqual('rgb(255, 255, 0)');
  }));

  it('updates simple', test(({ component, getElement }) => {
    component.style.backgroundColor = 'rgb(0, 0, 255)';
    component.style.color = undefined;
    return (done) => {
      const style = global.getComputedStyle(getElement('simple'));
      expect(style.backgroundColor).toEqual('rgb(0, 0, 255)');
      expect(style.color).toEqual('rgb(0, 0, 0)');
      done();
    };
  }));

  it('sets list', test(({ getElement }) => {
    const style = global.getComputedStyle(getElement('list'));
    expect(style.backgroundColor).toEqual('rgb(255, 0, 0)');
    expect(style.color).toEqual('rgb(255, 255, 0)');
  }));

  it('updates list', test(({ component, getElement }) => {
    component.style.backgroundColor = 'rgb(0, 0, 255)';
    component.style.color = undefined;

    return (done) => {
      const style = global.getComputedStyle(getElement('list'));
      expect(style.backgroundColor).toEqual('rgb(0, 0, 255)');
      expect(style.color).toEqual('rgb(0, 0, 0)');
      done();
    };
  }));

  it('clears list', test(({ component, getElement }) => {
    component.style = null;

    return (done) => {
      expect(!!getElement('list').getAttribute('style')).toEqual(false);
      done();
    };
  }));
});

import compose from '../../../src/plugins/compose';
import property from '../../../src/plugins/property';

describe('Plugin Compose:', () => {
  class Composer {
    static plugins = {
      property: property(),
    }

    constructor() {
      this.value = 'value';
    }
  }

  class Parent {
    static plugins = {
      composer: compose(Composer),
    }

    changed() {} // eslint-disable-line
  }

  const test = hybrid(Parent);

  it('initialize composed component', test(({ component }) => {
    expect(component.composer instanceof Composer).toBe(true);
    expect(component.composer.value).toBe('value');
  }));

  it('trigger change when composer is changed', test(({ component, el }) => {
    const spy = spyOn(component, 'changed');
    el.property = 'new value';

    return (done) => {
      expect(component.composer.property).toBe('new value');
      expect(spy).toHaveBeenCalledTimes(1);
      done();
    };
  }));
});

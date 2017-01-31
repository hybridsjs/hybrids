import schedule from '../src/schedule';

describe('core | schedule -', () => {
  rafIt('called in sync', () => {
    const spy1 = jasmine.createSpy('one');
    const spy2 = jasmine.createSpy('two');
    schedule(spy1);
    schedule(spy2);

    requestAnimationFrame(() => {
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });

  rafIt('called in callback', () => {
    const spy1 = jasmine.createSpy('one');
    const spy2 = jasmine.createSpy('two');
    schedule(() => {
      spy1();
      schedule(spy2);
    });

    requestAnimationFrame(() => {
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });
});

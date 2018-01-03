import State from '../../src/state';

describe('State:', () => {
  let target;
  let state;

  beforeEach(() => {
    state = new State();
    target = {
      one: 'one',
      two: 'two',
    };
  });

  it('returns initial diff', () => {
    expect(state.diff(target)).toEqual({
      one: { type: 'set', value: 'one', oldValue: undefined },
      two: { type: 'set', value: 'two', oldValue: undefined },
    });
  });

  describe('track changes -', () => {
    beforeEach(() => state.diff(target));

    it('no changes', () => {
      expect(state.diff(target)).toEqual(null);
    });

    it('switch two keys with new target', () => {
      const newTarget = {
        one: 'two',
        two: 'one',
      };

      expect(state.diff(newTarget, target)).toEqual({
        one: { type: 'set', value: 'two', oldValue: 'one', oldKey: 'two', newKey: 'two' },
        two: { type: 'set', value: 'one', oldValue: 'two', oldKey: 'one', newKey: 'one' },
      });
    });

    it('switch and add new key', () => {
      target.one = 'two';
      target.two = 'three';
      target.three = 'one';
      target.four = 'one';

      expect(state.diff(target)).toEqual({
        one: { type: 'set', value: 'two', oldValue: 'one', oldKey: 'two', newKey: 'three' },
        two: { type: 'set', value: 'three', newKey: 'one', oldValue: 'two' },
        three: { type: 'set', value: 'one', oldValue: undefined, oldKey: 'one' },
        four: { type: 'set', value: 'one', oldValue: undefined },
      });
    });

    it('uses different reference', () => {
      const newTarget = { two: 'two', three: 'one' };
      expect(state.diff(newTarget, target)).toEqual({
        one: { type: 'delete', newKey: 'three', oldValue: 'one' },
        three: { type: 'set', value: 'one', oldValue: undefined, oldKey: 'one' },
      });
    });

    it('clears when new target is falsy', () => {
      expect(state.diff(null, target)).toEqual({
        one: { type: 'delete', oldValue: 'one' },
        two: { type: 'delete', oldValue: 'two' },
      });
    });
  });
});

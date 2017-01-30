import filters from '../src/filters';

describe('engine | filters -', () => {
  it('reverses bool value', () => {
    expect(filters.not(true)).toEqual(false);
  });
});

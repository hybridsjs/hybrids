import * as filters from '../src/filters';

describe('Engine | Filters -', () => {
  it('reverse bool value', () => {
    expect(filters.not(true)).toEqual(false);
  });
});

import host from '../src/host';
import { callWithContext } from '../src/proxy';

describe('core | host -', () => {
  it('returns context', () => {
    const context = {};
    expect(callWithContext(context, host)).toEqual(context);
  });
});

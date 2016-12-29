import host from '../../src/plugins/host';
import { callWithContext } from '../../src/proxy';

describe('Core | Plugins | Host -', () => {
  it('return context', () => {
    const context = {};
    expect(callWithContext(context, host)).toEqual(context);
  });
});

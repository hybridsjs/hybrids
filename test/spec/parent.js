import define from '../../src/define';
import parent from '../../src/parent';

describe('parent:', () => {
  const parentHybrids = {
    customProperty: 'value',
  };

  define('test-parent-parent', parentHybrids);

  define('test-parent-child', {
    parent: parent(parentHybrids),
    computed: {
      get: host => `${host.parent.customProperty} other value`,
    },
  });

  const directParentTree = test(`
    <test-parent-parent>
      <test-parent-child></test-parent-child>
      <test-parent-child></test-parent-child>
    </test-parent-parent>
  `);

  const indirectParentTree = test(`
    <test-parent-parent>
      <div>
        <test-parent-child></test-parent-child>
      </div>
    </test-parent-parent>
  `);

  const shadowParentTree = test('<test-parent-parent></test-parent-parent>');
  const noParentTree = test('<test-parent-child></test-parent-child>');

  it('should connect with direct parent element', () => directParentTree((el) => {
    const child = el.children[0];
    expect(child.parent).toBe(el);
  }));

  it('should disconnect from parent element', done => directParentTree((el) => {
    const child = el.children[0];
    expect(child.parent).toBe(el);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(child);

    return Promise.resolve().then(() => {
      expect(child.parent).toBe(null);
      done();
    });
  }));

  it('should connect with indirect parent element', () => indirectParentTree((el) => {
    const child = el.children[0].children[0];
    expect(child.parent).toBe(el);
  }));

  it('should connect to out of the shadow parent element', () => shadowParentTree((el) => {
    const shadowRoot = el.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <div>
        <test-parent-child></test-parent-child>
      </div>
    `;

    const child = shadowRoot.children[0].children[0];
    expect(child.parent).toBe(el);
  }));

  it('should return null for no parent', () => noParentTree((el) => {
    expect(el.parent).toBe(null);
  }));

  it('should update child computed property', () => directParentTree((el) => {
    const spy = jasmine.createSpy('event callback');
    const child = el.children[0];

    expect(el.customProperty).toBe('value');
    expect(child.computed).toBe('value other value');

    child.addEventListener('@invalidate', spy);
    el.customProperty = 'new value';

    expect(child.computed).toBe('new value other value');
    expect(spy).toHaveBeenCalledTimes(1);
  }));
});

import define from '../../src/define';
import children from '../../src/children';
import { html } from '../../src/html';

describe('children:', () => {
  const child = {
    customName: '',
  };

  define('test-children-child', child);

  describe('direct children', () => {
    define('test-children-direct', {
      direct: children(child),
    });

    const tree = test(`
      <test-children-direct>
        <test-children-child custom-name="one">
          <test-children-child custom-name="five"></test-children-child>
        </test-children-child>
        <test-children-child custom-name="two"></test-children-child>
        <div>
          <test-children-child custom-name="three"></test-children-child>
        </div>
      </test-children-direct>
    `);

    it('returns list', () => tree((el) => {
      expect(el.direct).toEqual([
        el.children[0],
        el.children[1],
      ]);
    }));

    it('removes item from list', done => tree((el) => {
      el.removeChild(el.children[1]);

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(el.direct).toEqual([
            jasmine.objectContaining({ customName: 'one' }),
          ]);
          done();
          resolve();
        });
      });
    }));

    it('adds item to list', done => tree((el) => {
      const newItem = document.createElement('test-children-child');
      newItem.customName = 'four';

      el.appendChild(newItem);

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(el.direct).toEqual([
            jasmine.objectContaining({ customName: 'one' }),
            jasmine.objectContaining({ customName: 'two' }),
            jasmine.objectContaining({ customName: 'four' }),
          ]);
          done();
          resolve();
        });
      });
    }));

    it('reorder list items', done => tree((el) => {
      el.insertBefore(el.children[1], el.children[0]);

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(el.direct).toEqual([
            jasmine.objectContaining({ customName: 'two' }),
            jasmine.objectContaining({ customName: 'one' }),
          ]);
          done();
          resolve();
        });
      });
    }));
  });

  describe('deep children', () => {
    define('test-children-deep', {
      deep: children(child, { deep: true }),
    });

    const tree = test(`
      <test-children-deep>
        <test-children-child custom-name="one">
          <test-children-child custom-name="five"></test-children-child>
        </test-children-child>
        <test-children-child custom-name="two"></test-children-child>
        <div>
          <test-children-child custom-name="three"></test-children-child>
        </div>
      </test-children-deep>
    `);

    it('returns item list', () => tree((el) => {
      expect(el.deep).toEqual([
        jasmine.objectContaining({ customName: 'one' }),
        jasmine.objectContaining({ customName: 'two' }),
        jasmine.objectContaining({ customName: 'three' }),
      ]);
    }));

    it('removes item from list', done => tree((el) => {
      el.children[2].innerHTML = '';

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(el.deep).toEqual([
            jasmine.objectContaining({ customName: 'one' }),
            jasmine.objectContaining({ customName: 'two' }),
          ]);
          done();
          resolve();
        });
      });
    }));

    it('does not update if other children element is invalidated', done => tree(el => new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.children[0].children[0].customName = 'test';
          requestAnimationFrame(() => {
            expect(el.deep).toEqual([
              jasmine.objectContaining({ customName: 'one' }),
              jasmine.objectContaining({ customName: 'two' }),
              jasmine.objectContaining({ customName: 'three' }),
            ]);
            done();
            resolve();
          });
        });
      });
    })));
  });

  describe('nested children', () => {
    define('test-children-nested', {
      nested: children(child, { deep: true, nested: true }),
    });

    const tree = test(`
      <test-children-nested>
        <test-children-child custom-name="one">
          <test-children-child custom-name="five"></test-children-child>
        </test-children-child>
        <test-children-child custom-name="two"></test-children-child>
        <div>
          <test-children-child custom-name="three"></test-children-child>
        </div>
      </test-children-nested>
    `);

    it('returns item list', () => tree((el) => {
      expect(el.nested).toEqual([
        jasmine.objectContaining({ customName: 'one' }),
        jasmine.objectContaining({ customName: 'five' }),
        jasmine.objectContaining({ customName: 'two' }),
        jasmine.objectContaining({ customName: 'three' }),
      ]);
    }));

    it('removes item from list', done => tree((el) => {
      el.children[0].innerHTML = '';

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          expect(el.nested).toEqual([
            jasmine.objectContaining({ customName: 'one' }),
            jasmine.objectContaining({ customName: 'two' }),
            jasmine.objectContaining({ customName: 'three' }),
          ]);
          done();
          resolve();
        });
      });
    }));
  });

  describe('dynamic children', () => {
    const TestDynamicChild = {
      name: '',
    };

    const TestDynamicParent = {
      items: children(TestDynamicChild),
      render: ({ items }) => html`
        <div>
          ${items.map(({ name }) => html`<div>${name}</div>`.key(name))}
        </div>
        <slot></slot>
      `,
    };

    define('test-dynamic-wrapper', {
      items: [],
      render: ({ items }) => html`
        <test-dynamic-parent>
          <test-dynamic-child name="one"></test-dynamic-child>
          ${items.map(name => html`
            <test-dynamic-child name="${name}">${name}</test-dynamic-child>
          `)}
        </test-dynamic-parent>
      `.define({ TestDynamicParent, TestDynamicChild }),
    });

    const tree = test(`
      <test-dynamic-wrapper></test-dynamic-wrapper>
    `);

    it('adds dynamic item', done => tree(el => new Promise((resolve) => {
      setTimeout(() => {
        el.items = ['two'];
        setTimeout(() => {
          expect(el.shadowRoot.children[0].shadowRoot.children[0].children.length).toBe(2);
          done();
          resolve();
        }, 100);
      }, 100);
    })));
  });
});

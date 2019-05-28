import { test, resolveRaf, resolveTimeout } from '../helpers';
import define from '../../src/define';
import children from '../../src/children';
import { html } from '../../src/template';

describe('children:', () => {
  const child = {
    customName: '',
  };

  define('test-children-child', child);

  describe('direct children', () => {
    define('test-children-direct', {
      direct: children(child),
      customName: ({ direct }) => direct && direct[0] && direct[0].customName,
      render: ({ customName }) => html`${customName}`,
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

    it('returns list', tree((el) => {
      expect(el.direct).toEqual([
        el.children[0],
        el.children[1],
      ]);
    }));

    it('removes item from list', tree((el) => {
      el.removeChild(el.children[1]);

      return resolveRaf(() => {
        expect(el.direct).toEqual([
          jasmine.objectContaining({ customName: 'one' }),
        ]);
      });
    }));

    it('adds item to list', tree((el) => {
      const newItem = document.createElement('test-children-child');
      newItem.customName = 'four';

      el.appendChild(newItem);

      return resolveRaf(() => {
        expect(el.direct).toEqual([
          jasmine.objectContaining({ customName: 'one' }),
          jasmine.objectContaining({ customName: 'two' }),
          jasmine.objectContaining({ customName: 'four' }),
        ]);
      });
    }));

    it('reorder list items', tree((el) => {
      el.insertBefore(el.children[1], el.children[0]);

      return resolveRaf(() => {
        expect(el.direct).toEqual([
          jasmine.objectContaining({ customName: 'two' }),
          jasmine.objectContaining({ customName: 'one' }),
        ]);
      });
    }));

    it('updates parent computed property', tree(el => resolveTimeout(() => {
      expect(el.customName).toBe('one');
      el.children[0].customName = 'four';

      return resolveRaf(() => {
        expect(el.shadowRoot.innerHTML).toBe('four');
      });
    })));
  });

  describe('function condition', () => {
    define('test-children-fn', {
      direct: children(hybrids => hybrids === child),
    });

    const tree = test(`
      <test-children-fn>
        <test-children-child></test-children-child>
      </test-children-fn>
    `);

    it('returns item list', tree((el) => {
      expect(el.direct.length).toBe(1);
      expect(el.direct[0]).toBe(el.children[0]);
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

    it('returns item list', tree((el) => {
      expect(el.deep).toEqual([
        jasmine.objectContaining({ customName: 'one' }),
        jasmine.objectContaining({ customName: 'two' }),
        jasmine.objectContaining({ customName: 'three' }),
      ]);
    }));

    it('removes item from list', tree((el) => {
      el.children[2].innerHTML = '';

      return resolveRaf(() => {
        expect(el.deep).toEqual([
          jasmine.objectContaining({ customName: 'one' }),
          jasmine.objectContaining({ customName: 'two' }),
        ]);
      });
    }));

    it('does not update if other children element is invalidated', tree(el => resolveRaf(() => {
      el.children[0].children[0].customName = 'test';
      return resolveRaf(() => {
        expect(el.deep).toEqual([
          jasmine.objectContaining({ customName: 'one' }),
          jasmine.objectContaining({ customName: 'two' }),
          jasmine.objectContaining({ customName: 'three' }),
        ]);
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

    it('returns item list', tree((el) => {
      expect(el.nested).toEqual([
        jasmine.objectContaining({ customName: 'one' }),
        jasmine.objectContaining({ customName: 'five' }),
        jasmine.objectContaining({ customName: 'two' }),
        jasmine.objectContaining({ customName: 'three' }),
      ]);
    }));

    it('removes item from list', tree((el) => {
      el.children[0].innerHTML = '';

      return resolveRaf(() => {
        expect(el.nested).toEqual([
          jasmine.objectContaining({ customName: 'one' }),
          jasmine.objectContaining({ customName: 'two' }),
          jasmine.objectContaining({ customName: 'three' }),
        ]);
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
            <test-dynamic-child name="${name}"></test-dynamic-child>
          `.key(name))}
        </test-dynamic-parent>
      `.define({ TestDynamicParent, TestDynamicChild }),
    });

    const tree = test(`
      <test-dynamic-wrapper></test-dynamic-wrapper>
    `);

    it('adds dynamic item', tree(el => resolveTimeout(() => {
      el.items = ['two'];
      return resolveTimeout(() => {
        expect(el.shadowRoot.children[0].shadowRoot.children[0].children.length).toBe(2);
      });
    })));
  });
});

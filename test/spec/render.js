import { test, resolveRaf } from '../helpers';
import { define, html } from '../../src';
import render from '../../src/render';

describe('render:', () => {
  define('test-render', {
    value: 0,
    property: '',
    render: ({ value }) => (host, shadowRoot) => {
      shadowRoot.innerHTML = `<div>${value}</div>`;
    },
  });

  const tree = test(`
    <test-render></test-render>
  `);

  it('throws if an argument is not a function', () => {
    expect(() => {
      define('test-render-throws', {
        render: render({}),
      });
    }).toThrow();
  });

  it('renders content', tree(el => resolveRaf(() => {
    expect(el.shadowRoot.children[0].textContent).toBe('0');
  })));

  it('updates content', tree(el => resolveRaf(() => {
    el.value = 1;
    return resolveRaf(() => {
      expect(el.shadowRoot.children[0].textContent).toBe('1');
    });
  })));

  it('renders content on direct call', tree((el) => {
    el.render();
    expect(el.shadowRoot.children[0].textContent).toBe('0');
  }));

  it('does not re-create shadow DOM', tree((el) => {
    const shadowRoot = el.shadowRoot;
    const parent = el.parentElement;
    parent.removeChild(el);

    return resolveRaf(() => {
      parent.appendChild(el);
      expect(el.shadowRoot).toBe(shadowRoot);
    });
  }));

  it('renders elements in parent slot', (done) => {
    const TestRenderParentSlot = {
      render: () => html`<slot></slot>`,
    };

    define('test-render-parent-slot', TestRenderParentSlot);

    const slotTree = test(`
      <test-render-parent-slot>
        <test-render></test-render>
      </test-render-parent-slot>
    `);

    slotTree(el => resolveRaf(() => {
      expect(el.children[0].shadowRoot.children[0].textContent).toBe('0');
    }))(done);
  });

  describe('options object with shadowRoot option', () => {
    it('for false renders template in light DOM', (done) => {
      define('test-render-light-dom', {
        testValue: true,
        render: render(({ testValue }) => (testValue
          ? html`
            <div>true</div>
          `
          : html`
            <div>false</div>
          `), { shadowRoot: false }),
      });

      test(`
        <test-render-light-dom>
          <div>other content</div>
        </test-render-light-dom>
      `)(el => resolveRaf(() => {
        expect(el.children.length).toBe(1);
        expect(el.children[0].innerHTML).toBe('true');

        el.testValue = false;

        return resolveRaf(() => {
          expect(el.children.length).toBe(1);
          expect(el.children[0].innerHTML).toBe('false');
        });
      }))(done);
    });

    it('for object creates shadowRoot with "delegatesFocus" option', (done) => {
      const TestRenderCustomShadow = define('test-render-custom-shadow', {
        render: render(() => html`
          <input type="text" />
        `, { shadowRoot: { delegatesFocus: true } }),
      });
      const origAttachShadow = TestRenderCustomShadow.prototype.attachShadow;
      const spy = jasmine.createSpy('attachShadow');

      TestRenderCustomShadow.prototype.attachShadow = function attachShadow(...args) {
        spy(...args);
        return origAttachShadow.call(this, ...args);
      };

      test(`
        <test-render-custom-shadow></test-render-custom-shadow>
      `)(() => {
        expect(spy).toHaveBeenCalledWith({ mode: 'open', delegatesFocus: true });
      })(done);
    });
  });
});

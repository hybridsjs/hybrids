import { test, resolveRaf, resolveTimeout } from '../helpers';
import { define, html } from '../../src';
import render, { update } from '../../src/render';

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

  it('renders content', done => tree(el => resolveRaf(() => {
    expect(el.shadowRoot.children[0].textContent).toBe('0');
    done();
  })));

  it('updates content', done => tree(el => resolveRaf(() => {
    el.value = 1;
    return resolveRaf(() => {
      expect(el.shadowRoot.children[0].textContent).toBe('1');
      done();
    });
  })));

  it('does not render when element is out of the document', done => tree((el) => {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(el);

    return resolveRaf(() => {
      expect(el.shadowRoot.innerHTML).toBe('');
      done();
    });
  }));

  it('does not render if getter does not change', done => tree(el => resolveRaf(() => {
    el.property = 'new value';
    return resolveRaf(() => {
      expect(el.shadowRoot.children[0].textContent).toBe('0');
      done();
    });
  })));

  it('renders content on direct call', () => tree((el) => {
    el.render();
    expect(el.shadowRoot.children[0].textContent).toBe('0');
  }));

  it('does not re-create shadow DOM', done => tree((el) => {
    const shadowRoot = el.shadowRoot;
    const parent = el.parentElement;
    parent.removeChild(el);

    return resolveRaf(() => {
      parent.appendChild(el);
      expect(el.shadowRoot).toBe(shadowRoot);
      done();
    });
  }));

  describe('defer next update tasks after threshold', () => {
    define('test-render-long', {
      nested: false,
      delay: false,
      value: '',
      render: ({ nested, delay, value }) => (target, shadowRoot) => {
        let template = `<div>${value}</div>`;

        if (nested) {
          template += `
            <test-render-long delay></test-render-long>
            <test-render-long delay></test-render-long>
          `;
        }
        if (delay) {
          const now = performance.now();
          while (performance.now() - now < 20);
        }

        shadowRoot.innerHTML = template;
      },
    });

    it('renders nested elements', done => test(`
      <div>
        <test-render-long nested value="one"></test-render-long>
      </div>
    `)(el => new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const one = el.children[0];
            expect(one.shadowRoot.children[0].textContent).toBe('one');
            resolve();
            done();
          });
        });
      });
    })));

    it('renders nested elements with delay', done => test(`
      <div>
        <test-render-long nested delay value="one"></test-render-long>
      </div>
    `)(el => new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const one = el.children[0];
            expect(one.shadowRoot.children[0].textContent).toBe('one');
            resolve();
            done();
          });
        });
      });
    })));
  });

  it('update function catches error in render function', (done) => {
    let fn = () => { throw Error(); };
    define('test-render-throws-in-render', {
      render: () => fn(),
    });

    test('<test-render-throws-in-render></test-render-throws-in-render>')(() => {
      Promise.resolve().then(() => {
        expect(() => {
          update();
        }).toThrow();
        fn = () => {};
        done();
      });
    });
  });

  it('update function catches error in result of render function', (done) => {
    let fn = () => { throw Error('example error'); };
    define('test-render-throws-in-callback', {
      render: () => fn,
    });

    test('<test-render-throws-in-callback></test-render-throws-in-callback>')(() => {
      Promise.resolve().then(() => {
        expect(() => {
          update();
        }).toThrow();
        fn = () => {};
        done();
      });
    });
  });

  describe('shady css custom property scope', () => {
    const TestShadyChild = {
      value: 0,
      render: ({ value }) => html`
        <span>${value}</span>
        <style>
          span {
            color: var(--custom-color);
          }
        </style>
      `,
    };

    const TestShadyParent = {
      active: false,
      render: ({ active }) => html`
        <test-shady-child class="${{ active }}"></test-shady-child>
        <style>
          test-shady-child {
            --custom-color: red;
          }
          test-shady-child.active {
            --custom-color: blue;
          }
        </style>
      `.define({ TestShadyChild }),
    };

    define('test-shady-parent', TestShadyParent);

    const shadyTree = test(`
      <test-shady-parent></test-shady-parent>
    `);

    it('should set custom property', done => shadyTree(el => resolveTimeout(() => {
      const { color } = window.getComputedStyle(el.shadowRoot.children[0].shadowRoot.children[0]);
      expect(color).toBe('rgb(255, 0, 0)');
      done();
    })));

    it('should update custom property', done => shadyTree(el => resolveTimeout(() => {
      el.active = true;
      return resolveTimeout(() => {
        const { color } = window.getComputedStyle(el.shadowRoot.children[0].shadowRoot.children[0]);
        expect(color).toBe('rgb(0, 0, 255)');
        done();
      });
    })));
  });

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
      done();
    }));
  });

  it('throws error for duplicate render', () => {
    const hybrids = {
      renderOne: render(() => () => {}),
      renderTwo: render(() => () => {}),
    };

    const el = document.createElement('div');

    expect(() => {
      hybrids.renderOne.connect(el, 'renderOne');
      hybrids.renderTwo.connect(el, 'renderTwo');
    }).toThrow();
  });

  describe('shadyCSS polyfill', () => {
    const shadyCSSApplied = window.ShadyCSS && !window.ShadyCSS.nativeShadow;

    beforeAll(() => {
      if (!shadyCSSApplied) {
        window.ShadyCSS = {
          prepareTemplate: template => template,
          styleElement: jasmine.createSpy(),
          styleSubtree: jasmine.createSpy(),
        };
      } else {
        spyOn(window.ShadyCSS, 'styleElement');
        spyOn(window.ShadyCSS, 'styleSubtree');
      }
    });

    afterAll(() => {
      if (!shadyCSSApplied) {
        delete window.ShadyCSS;
      }
    });

    it('uses styleElement on first paint', done => tree(() => resolveTimeout(() => {
      expect(window.ShadyCSS.styleElement).toHaveBeenCalled();
      done();
    })));

    it('uses styleSubtree on sequential paint', done => tree(el => resolveRaf(() => {
      el.value = 1;
      return resolveTimeout(() => {
        expect(window.ShadyCSS.styleSubtree).toHaveBeenCalled();
        done();
      });
    })));
  });

  describe('options object with shadowRoot option', () => {
    it('for false appends template to light DOM', (done) => {
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
        expect(el.children.length).toBe(2);
        expect(el.children[0].innerHTML).toBe('other content');
        expect(el.children[1].innerHTML).toBe('true');

        el.testValue = false;

        return resolveRaf(() => {
          expect(el.children.length).toBe(2);
          expect(el.children[0].innerHTML).toBe('other content');
          expect(el.children[1].innerHTML).toBe('false');
          done();
        });
      }));
    });

    it('for object creates shadowRoot with "delegatesFocus" option', () => {
      const TestRenderCustomShadow = define('test-render-custom-shadow', {
        render: render(() => html`
          <input type="text" />
        `, { shadowRoot: { delegatesFocus: true } }),
      });
      const spy = spyOn(TestRenderCustomShadow.prototype, 'attachShadow');

      test(`
        <test-render-custom-shadow></test-render-custom-shadow>
      `)(() => {
        expect(spy).toHaveBeenCalledWith({ mode: 'open', delegatesFocus: true });
      });
    });
  });
});

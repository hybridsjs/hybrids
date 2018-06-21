import { define, html } from '../../src';
import render, { update } from '../../src/render';

const resolveRaf = fn => new Promise((resolve) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      Promise.resolve()
        .then(fn)
        .then(resolve);
    });
  });
});

const resolveTimeout = fn => new Promise((resolve) => {
  setTimeout(() => {
    Promise.resolve()
      .then(fn)
      .then(resolve);
  }, 250);
});

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

  it('defer next update tasks after threshold', (done) => {
    define('test-render-long', {
      value: '',
      render: ({ value }) => (target, shadowRoot) => {
        const now = performance.now();
        while (performance.now() - now < 20);

        shadowRoot.innerHTML = `<div>${value}</div>`;
      },
    });

    test(`
      <div>
        <test-render-long value="one"></test-render-long>
        <test-render-long value="two"></test-render-long>
      </div>
    `)(el => new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const one = el.children[0];
            const two = el.children[1];
            expect(one.shadowRoot.children[0].textContent).toBe('one');
            expect(two.shadowRoot.children[0].textContent).toBe('two');
            expect(two.shadowRoot.children.length).toBe(1);
            resolve();
            done();
          });
        });
      });
    }));
  });

  it('update function catches error in render function', (done) => {
    let fn = () => { throw Error(); };
    define('test-render-throws-in-render', {
      render: () => fn(),
    });

    test('<test-render-throws-in-render></test-render-throws-in-render>')(() => {
      expect(() => {
        update();
      }).toThrow();
      fn = () => {};
      done();
    });
  });

  it('update function catches error in result of render function', (done) => {
    setTimeout(() => {
      let fn = () => { throw Error('example error'); };
      define('test-render-throws-in-callback', {
        render: () => fn,
      });

      test('<test-render-throws-in-callback></test-render-throws-in-callback>')(() => {
        Promise.resolve(update()).catch((e) => {
          expect(e instanceof Error).toBe(true);
          fn = () => {};
          done();
        });
      });
    }, 100);
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
    const shadyCSSApplied = typeof window.ShadyCSS === 'object';

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

    it('uses styleElement and styleSubtree', done => tree(() => resolveTimeout(() => {
      expect(window.ShadyCSS.styleElement).toHaveBeenCalled();
      expect(window.ShadyCSS.styleSubtree).toHaveBeenCalled();
      done();
    })));
  });
});

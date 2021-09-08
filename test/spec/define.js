import { test, resolveRaf } from "../helpers.js";
import define from "../../src/define.js";
import { invalidate } from "../../src/cache.js";
import { html } from "../../src/index.js";

describe("define:", () => {
  it("throws when element constructor is not an object", () => {
    expect(() => define("test-define-multiple", null)).toThrow();
  });

  it("returns custom element with a name", () => {
    const CustomElement = define("test-define-custom-element", {});
    expect(
      {}.isPrototypeOf.call(HTMLElement.prototype, CustomElement.prototype),
    ).toBe(true);
    expect(CustomElement.name).toBe("test-define-custom-element");
  });

  it("returns the constructor without defining in the registry", () => {
    const MyElement = {
      value: "test",
    };

    const Constructor = define(null, MyElement);

    expect(Constructor.prototype.value).toBeDefined();
    expect(define(null, MyElement)).not.toBe(Constructor);

    customElements.define("test-define-from-constructor", Constructor);
    const el = document.createElement("test-define-from-constructor");

    expect(el.value).toBe("test");
  });

  describe("for objects", () => {
    it("defines tagged components", done => {
      const testHtmlDefine = { tag: "testHtmlDefine", value: "test" };
      const TestPascal = { tag: "TestPascal", value: "value-test-pascal" };
      const HTMLDefine = { tag: "HTMLDefine", value: "value-html-define" };
      const result = define(testHtmlDefine, TestPascal, HTMLDefine);

      expect(result).toEqual([testHtmlDefine, TestPascal, HTMLDefine]);
      expect(define(HTMLDefine)).toBe(HTMLDefine);

      requestAnimationFrame(() => {
        const testHtmlDefineEl = document.createElement("test-html-define");
        const testPascalEl = document.createElement("test-pascal");
        const htmlDefineEl = document.createElement("html-define");

        expect(testHtmlDefineEl.value).toBe("test");
        expect(testPascalEl.value).toBe("value-test-pascal");
        expect(htmlDefineEl.value).toBe("value-html-define");

        done();
      });
    });

    it("updates tagged component", () => {
      const component = { tag: "test-define-update-component", value: "test" };
      define(component);
      define({ ...component });

      const el = document.createElement("test-define-update-component");
      expect("tag" in el).toBe(false);
    });

    it("throws for element without 'tag' string property", () => {
      expect(() => {
        define({ value: "test" });
      }).toThrow();
      expect(() => {
        define({ tag: 0, value: "test" });
      }).toThrow();
    });
  });

  describe("for object descriptor", () => {
    let connectSpy;
    let observeSpy;
    let disconnectSpy;

    define("test-define-object", {
      one: {
        get: (host, v) => v + 1,
        set: (host, newVal) => newVal,
        connect: (...args) => {
          connectSpy(...args);
          return disconnectSpy;
        },
      },
      two: {
        set: (host, value) => value * value,
      },
      three: {
        one: "one",
        two: "two",
      },
      four: {
        connect: (host, key) => {
          host[key] = "four";
        },
      },
      five: {
        observe: (...args) => observeSpy(...args),
      },
    });

    const tree = test("<test-define-object></test-define-object>");

    beforeEach(() => {
      connectSpy = jasmine.createSpy();
      observeSpy = jasmine.createSpy();
      disconnectSpy = jasmine.createSpy();
    });

    it(
      "sets getter and setter",
      tree(el => {
        el.one = 10;
        expect(el.one).toBe(11);
      }),
    );

    it(
      "sets setter and uses default getter",
      tree(el => {
        el.two = 10;
        expect(el.two).toBe(100);
      }),
    );

    it("does not set property for object descriptor", () =>
      tree(el => {
        expect(el.three).toEqual(undefined);
      }));

    it(
      "uses default get and set methods when both omitted",
      tree(el => {
        expect(el.four).toEqual("four");
      }),
    );

    it(
      "calls connect method",
      tree(el => {
        expect(connectSpy.calls.first().args[0]).toBe(el);
        expect(connectSpy.calls.first().args[1]).toBe("one");
      }),
    );

    it(
      "calls disconnect method",
      tree(el => {
        el.parentElement.removeChild(el);
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
      }),
    );

    it(
      "returns previous value when invalidate",
      tree(el => {
        el.one = 10;
        expect(el.one).toBe(11);
        invalidate(el, "one");
        expect(el.one).toBe(12);
      }),
    );

    it(
      "calls observe method",
      tree(el => {
        expect(observeSpy).toHaveBeenCalledTimes(0);
        el.five = 1;
        return resolveRaf(() => {
          expect(observeSpy).toHaveBeenCalledTimes(1);
          expect(observeSpy).toHaveBeenCalledWith(el, 1, undefined);
        });
      }),
    );

    it(
      "does not call observe method if value did not change",
      tree(el => {
        el.five = 1;
        return resolveRaf(() => {
          expect(observeSpy).toHaveBeenCalledTimes(1);
          el.one = 1;
          el.five = 2;
          el.five = 1;
          return resolveRaf(() => {
            expect(observeSpy).toHaveBeenCalledTimes(1);
          });
        });
      }),
    );

    it(
      "does not call observe method if element is disconnected",
      tree(el => {
        el.five = 1;
        el.parentElement.removeChild(el);
        return resolveRaf(() => {
          expect(observeSpy).toHaveBeenCalledTimes(0);
        });
      }),
    );
  });

  describe("for primitive value", () => {
    define("test-define-primitive", {
      testProperty: "value",
    });

    const tree = test(`
      <test-define-primitive></test-define-primitive>
    `);

    it(
      "applies property module with passed argument",
      tree(el => {
        expect(el.testProperty).toBe("value");
      }),
    );
  });

  describe("for function descriptor", () => {
    define("test-define-function", {
      getter: () => "some value",
    });

    const tree = test(`
      <test-define-function></test-define-function>
    `);

    it(
      "sets it as getter of the element property",
      tree(el => {
        expect(el.getter).toBe("some value");
      }),
    );
  });

  describe("for 'render' key", () => {
    const tree = test(`
      <test-define-render></test-define-render>
    `);

    beforeAll(() => {
      define({
        tag: "test-define-render",
        value: 0,
        property: "",
        render: ({ value }) => (host, shadowRoot) => {
          shadowRoot.innerHTML = `<div>${value}</div>`;
        },
      });
    });

    it(
      "renders content",
      tree(el =>
        resolveRaf(() => {
          expect(el.shadowRoot.children[0].textContent).toBe("0");
        }),
      ),
    );

    it(
      "updates content",
      tree(el =>
        resolveRaf(() => {
          el.value = 1;
          return resolveRaf(() => {
            expect(el.shadowRoot.children[0].textContent).toBe("1");
          });
        }),
      ),
    );

    it(
      "renders content on direct call",
      tree(el => {
        const target = el.render();

        expect(target).toBe(el.shadowRoot);
        expect(el.shadowRoot.children[0].textContent).toBe("0");
      }),
    );

    it(
      "does not re-create shadow DOM",
      tree(el => {
        const shadowRoot = el.shadowRoot;
        const parent = el.parentElement;
        parent.removeChild(el);

        return resolveRaf(() => {
          parent.appendChild(el);
          expect(el.shadowRoot).toBe(shadowRoot);
        });
      }),
    );

    it("renders elements in parent slot", done => {
      define({
        tag: "test-define-render-parent-slot",
        render: () =>
          html`
            <slot></slot>
          `,
      });

      const slotTree = test(`
        <test-define-render-parent-slot>
          <test-define-render></test-define-render>
        </test-define-render-parent-slot>
      `);

      slotTree(el =>
        resolveRaf(() => {
          expect(el.children[0].shadowRoot.children[0].textContent).toBe("0");
        }),
      )(done);
    });

    it('creates shadowRoot with "delegatesFocus" option', done => {
      define({
        tag: "test-render-custom-shadow",
        render: Object.assign(
          () => html`
            <input type="text" />
          `,
          { mode: "closed", delegatesFocus: true },
        ),
      });

      const TestRenderCustomShadowEl = customElements.get(
        "test-render-custom-shadow",
      );

      const origAttachShadow = TestRenderCustomShadowEl.prototype.attachShadow;
      const spy = jasmine.createSpy("attachShadow");

      TestRenderCustomShadowEl.prototype.attachShadow = function attachShadow(
        ...args
      ) {
        spy(...args);
        return origAttachShadow.call(this, ...args);
      };

      test(`
        <test-render-custom-shadow></test-render-custom-shadow>
      `)(() =>
        resolveRaf(() => {
          expect(spy).toHaveBeenCalledWith({
            mode: "closed",
            delegatesFocus: true,
          });
        }),
      )(done);
    });

    it("uses render factory if value is a function", done => {
      tree(el => {
        expect(typeof el.render).toBe("function");
      })(done);
    });

    it("does not use render factory if value is not a function", done => {
      define({
        tag: "test-define-render-other",
        render: [],
      });
      test("<test-define-render-other></test-define-render-other>")(el => {
        expect(typeof el.render).toBe("object");
      })(done);
    });
  });

  describe("for 'content' key", () => {
    it("uses render factory if value is a function", done => {
      define({
        tag: "test-render-light-dom",
        testValue: true,
        content: ({ testValue }) =>
          testValue
            ? html`
                <div>true</div>
              `
            : html`
                <div>false</div>
              `,
      });

      test(`
        <test-render-light-dom>
          <div>other content</div>
        </test-render-light-dom>
      `)(el =>
        resolveRaf(() => {
          expect(el.content).toBeInstanceOf(Function);
          expect(el.children.length).toBe(1);
          expect(el.children[0].innerHTML).toBe("true");

          el.testValue = false;

          return resolveRaf(() => {
            expect(el.children.length).toBe(1);
            expect(el.children[0].innerHTML).toBe("false");
          });
        }),
      )(done);
    });

    it("does not use render factory if value is not a function", done => {
      define({
        tag: "test-define-content-other",
        content: [],
      });

      const tree = test(
        "<test-define-content-other></test-define-content-other>",
      );

      tree(el => {
        expect(typeof el.content).toBe("object");
      })(done);
    });
  });

  describe("for array descriptor", () => {
    const one = [];

    define("test-define-empty-object", {
      one,
    });

    const tree = test(`
      <test-define-empty-object></test-define-empty-object>
    `);

    it(
      "sets object as a property",
      tree(el => {
        expect(el.one).toBe(one);
      }),
    );
  });

  describe("already defined element", () => {
    const hybrids = {
      tag: "test-define-multiple",
      one: true,
    };

    define(hybrids);
    const CustomElement = customElements.get("test-define-multiple");
    define({ tag: "test-define-multiple-two" });

    const editTree = test(`
      <test-define-multiple>
        <test-define-multiple-two></test-define-multiple-two>
      </test-define-multiple>
    `);

    it("throws an error for replacing other custom element", () => {
      customElements.define("test-define-multiple-other", HTMLElement);
      expect(() => define("test-define-multiple-other", {})).toThrow();
    });

    it("returns the same custom element", () => {
      expect(define("test-define-multiple", hybrids)).toBe(CustomElement);
    });

    it("updates when hybrids does not match", done => {
      test(`
        <test-define-multiple>
          <test-define-multiple-two></test-define-multiple-two>
        </test-define-multiple>
      `)(el => {
        const spy = jasmine.createSpy("connect");
        const newHybrids = {
          one: "text",
          two: {
            get: () => null,
            connect: spy,
          },
        };
        define("test-define-multiple", newHybrids);
        define("test-define-multiple-two", newHybrids);

        return Promise.resolve().then(() => {
          expect(el.one).toBe("text");
          expect(el.children[0].one).toBe("text");

          expect(spy).toHaveBeenCalledTimes(2);
        });
      })(done);
    });

    it(
      "updates & calls observe only on connected elements when hybrids does not match",
      editTree(el => {
        const spy = jasmine.createSpy("connect");
        const newHybrids = {
          one: "text",
          two: {
            get: () => "test",
            observe: spy,
          },
        };

        define("test-define-multiple", newHybrids);
        define("test-define-multiple-two", newHybrids);

        el.innerHTML = "<test-define-multiple-two></test-define-multiple-two>";

        return resolveRaf(() => {
          expect(el.one).toBe("text");
          expect(el.children[0].one).toBe("text");

          expect(spy).toHaveBeenCalledTimes(2);
        });
      }),
    );

    it("updates elements in shadowRoot", done => {
      test("<div></div>")(el => {
        const connect = jasmine.createSpy();

        el.attachShadow({ mode: "open" });
        const child = document.createElement("test-define-multiple");
        el.shadowRoot.appendChild(child);

        define("test-define-multiple", {
          one: { get: () => "text", connect },
        });

        return Promise.resolve().then(() => {
          expect(connect).toHaveBeenCalledTimes(1);
          expect(child.one).toBe("text");
        });
      })(done);
    });
  });
});

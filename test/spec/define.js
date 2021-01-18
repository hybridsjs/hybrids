import { test, resolveRaf } from "../helpers.js";
import define from "../../src/define.js";
import { invalidate } from "../../src/cache.js";

describe("define:", () => {
  it("throws when element constructor is not a function or an object", () => {
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

  describe("for map argument", () => {
    it("defines hybrids", done => {
      const testHtmlDefine = { value: "test" };
      const TestPascal = { value: "value-test-pascal" };
      const HTMLDefine = { value: "value-html-define" };
      define({ testHtmlDefine, TestPascal, HTMLDefine });

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

    it("defines custom elements constructor", () => {
      class TestHtmlDefineExternalA extends HTMLElement {
        constructor() {
          super();
          this.value = "test";
        }
      }

      define({ TestHtmlDefineExternalA });
      define({ TestHtmlDefineExternalA });

      const el = document.createElement("test-html-define-external-a");
      expect(el.value).toBe("test");
    });

    it("throws for invalid value", () => {
      expect(() => {
        define({ testHtmlDefineExternalD: "value" });
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

  describe("for render key", () => {
    it("uses render factory if value is a function", done => {
      define("test-define-render", {
        render: () => () => {},
      });

      const tree = test("<test-define-render></test-define-render>");

      tree(el => {
        expect(typeof el.render).toBe("function");
      })(done);
    });

    it("does not use render factory if value is not a function", done => {
      define("test-define-render-other", {
        render: [],
      });

      const tree = test(
        "<test-define-render-other></test-define-render-other>",
      );

      tree(el => {
        expect(typeof el.render).toBe("object");
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
      one: true,
    };

    const CustomElement = define("test-define-multiple", hybrids);
    define("test-define-multiple-two", {});

    const editTree = test(`
      <test-define-multiple>
        <test-define-multiple-two></test-define-multiple-two>
      </test-define-multiple>
    `);

    it("throws when element is built with constructor", () => {
      define("test-define-multiple-class", class extends HTMLElement {});
      expect(() => define("test-define-multiple-class", {})).toThrow();
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

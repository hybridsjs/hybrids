import { define, html } from "../../src/index.js";
import { resolveRaf } from "../helpers.js";

describe("define:", () => {
  let el;
  let spy;

  afterEach(() => {
    if (el && el.parentElement) el.parentElement.removeChild(el);
  });

  it("throws when 'tag' property is missing or not a dashed string", () => {
    expect(() => {
      define({ prop1: "value1" });
    }).toThrow();

    expect(() => {
      define({ tag: null, prop1: "value1" });
    }).toThrow();

    expect(() => {
      define({ tag: "test", prop1: "value1" });
    }).toThrow();
  });

  it("throws when another external element is defined on the same tag name", () => {
    customElements.define("test-define-external", class extends HTMLElement {});
    expect(() => {
      define({ tag: "test-define-external", prop1: "value1" });
    }).toThrow();
  });

  it("throws when get or set methods are defined", () => {
    expect(() => {
      define({
        tag: "test-define-throws",
        prop: {
          get: () => {},
          set: () => {},
        },
      });
    }).toThrow();
  });

  it("throws when render value is not a function", () => {
    expect(() => {
      define({
        tag: "test-define-throws",
        render: "string",
      });
    }).toThrow();
  });

  it("throws when reflect option is defined for render key", () => {
    expect(() => {
      define({
        tag: "test-define-throws",
        render: {
          value: () => html`<div></div>`,
          reflect: true,
        },
      });
    }).toThrow();
  });

  it("returns passed hybrids", () => {
    const hybrids = { tag: "test-define-twice" };
    expect(define(hybrids)).toBe(hybrids);
    expect(define(hybrids)).toBe(hybrids);
  });

  it("returns a class constructor when compile method is used", () => {
    expect(define.compile({ some: "" }).prototype).toBeInstanceOf(HTMLElement);
  });

  it("redefines the same element", () => {
    define({
      tag: "test-define-same-deep",
      prop: "test",
    });

    define({
      tag: "test-define-same",
      prop1: "test",
      prop2: "other",
      render: () => html` <test-define-same-deep></test-define-same-deep> `,
    });

    el = document.createElement("test-define-same");
    document.body.appendChild(el);

    return resolveRaf(() => {
      define({
        tag: "test-define-same",
        prop2: "test",
        render: () => html` <test-define-same-deep></test-define-same-deep> `,
      });

      define({
        tag: "test-define-same-deep",
        prop: () => "other",
      });

      return resolveRaf(() => {
        expect(el.prop1).toBe(undefined);
        expect(el.prop2).toBe("test");

        expect(el.shadowRoot.children[0].prop).toBe("other");
      });
    });
  });

  it("upgrades values from the instance", () => {
    el = document.createElement("test-define-upgrade-values");
    el.prop1 = "0";
    el.prop2 = "asdf";

    document.body.appendChild(el);

    define({
      tag: "test-define-upgrade-values",
      prop1: 0,
      prop2: false,
    });

    expect(el.prop1).toBe(0);
    expect(el.prop2).toBe(true);
  });

  it("invalidates property value", () => {
    spy = jasmine.createSpy();
    let ref;
    const count = 0;

    define({
      tag: "test-define-invalidate-value",
      prop: {
        value: () => count,
        connect(host, key, invalidate) {
          ref = invalidate;
        },
      },
      otherProp: ({ prop }) => {
        spy();
        return prop;
      },
    });

    el = document.createElement("test-define-invalidate-value");
    document.body.appendChild(el);

    return Promise.resolve().then(() => {
      expect(el.prop).toBe(0);
      expect(el.otherProp).toBe(0);
      expect(el.otherProp).toBe(0);
      expect(spy).toHaveBeenCalledTimes(1);

      ref();
      expect(el.otherProp).toBe(0);
      expect(spy).toHaveBeenCalledTimes(2);

      ref({ force: true });
      expect(el.otherProp).toBe(0);
      expect(spy).toHaveBeenCalledTimes(3);
    });
  });

  // Relates to https://github.com/hybridsjs/hybrids/issues/229
  // with a move of clearing deps and context in cache
  // There is still a problem with "prop3" which is not updated in render
  // but it happens because the render was already called after the prop1 observer
  it("render method is called when observed chain of properties changes", () => {
    define({
      tag: "test-define-render-observed",
      prop1: {
        value: 0,
        observe(host, value) {
          host.prop2 = value;
        },
      },
      prop2: {
        value: 0,
        observe(host, value) {
          host.prop3 = value;
        },
      },
      prop3: 0,
      render: ({ prop1, prop2, prop3 }) =>
        // prettier-ignore
        html`<div>${prop1}</div><div>${prop2}</div><div>${prop3}</div>`,
    });

    el = document.createElement("test-define-render-observed");
    document.body.appendChild(el);

    return resolveRaf(() => {
      expect(el.shadowRoot.innerHTML).toBe(
        "<div>0</div><div>0</div><div>0</div>",
      );

      el.prop1 = 1;

      return resolveRaf(() => {
        expect(el.shadowRoot.innerHTML).toBe(
          "<div>1</div><div>1</div><div>0</div>",
        );

        el.prop1 = 2;

        return resolveRaf(() => {
          expect(el.shadowRoot.innerHTML).toBe(
            "<div>2</div><div>2</div><div>1</div>",
          );
        });
      });
    });
  });

  describe("created element", () => {
    let observeSpy;

    beforeAll(() => {
      define({
        tag: "test-define-default",
        prop1: "default",
        prop2: 0,
        prop3: {
          value: false,
          reflect: true,
          connect: (...args) => spy && spy(...args),
        },
        prop4: { value: "test", reflect: true },
        prop5: {
          value: undefined,
          reflect: (value) => "This is " + value,
          observe: (...args) => observeSpy && observeSpy(...args),
        },
        stringReflect: { value: "test", reflect: true },
        numberReflect: { value: 0, reflect: true },
        undefinedReflect: { value: undefined, reflect: true },
        fnReflect: { value: "test", reflect: (v) => v + "!" },
        array: { value: ["a", "b", "c"] },
        boolTrue: true,
        computed: ({ prop2, prop3 }) => `${prop2} ${prop3}`,
        fullDesc: () => "fullDesc",
        fullDescWritable: {
          value: (host, val) => (val ? val * 2 : 0),
          writable: true,
        },
        fullDescReadonly: {
          value: () => 0,
        },
        notDefined: undefined,
        render: ({ prop1 }) =>
          html`<div>${prop1}</div>`, // prettier-ignore
        content: ({ prop1 }) =>
          html`<div>${prop1}</div>`, // prettier-ignore
      });
    });

    beforeEach(() => {
      el = document.createElement("test-define-default");
    });

    it("throws when assert readonly full description", () => {
      expect(() => {
        el.fullDescReadonly = 1;
      }).toThrow();
    });

    it("returns an element with defined properties", () => {
      expect(el.prop1).toBe("default");
      expect(el.prop2).toBe(0);
      expect(el.prop3).toBe(false);
      expect(el.prop4).toBe("test");
      expect(el.prop5).toBe(undefined);
      expect(el.array).toEqual(["a", "b", "c"]);
      expect(el.computed).toBe("0 false");
      expect(el.fullDesc).toBe("fullDesc");
      expect(el.fullDescWritable).toBe(0);
      expect(el.notDefined).toBe(undefined);
    });

    it("freezes properties view object values", () => {
      expect(() => {
        el.array.push("d");
      }).toThrow();
    });

    it("sets initial values from corresponding attributes", () => {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `
        <test-define-default
          prop1="a"
          prop2="2"
          prop3=""
          bool-true=""
          full-desc-writable="2"
          not-defined="abc"
        ></test-define-default>
      `;

      el = wrapper.firstElementChild;

      expect(el.prop1).toBe("a");
      expect(el.prop2).toBe(2);
      expect(el.prop3).toBe(true);
      expect(el.fullDescWritable).toEqual(4);
      expect(el.notDefined).toEqual("abc");
    });

    it("updates properties and reflects them to corresponding attributes", () => {
      el.prop1 = "";
      expect(el.prop1).toBe("");

      el.prop1 = "a";
      expect(el.prop1).toBe("a");

      el.prop2 = "1";
      expect(el.prop2).toBe(1);

      el.prop3 = "true";
      expect(el.prop3).toBe(true);

      el.prop4 = "test 2";
      expect(el.prop4).toBe("test 2");

      el.fullDescWritable = 1;
      expect(el.fullDescWritable).toBe(2);

      el.notDefined = "abc";

      expect(el.stringReflect).toBe("test");
      el.stringReflect = "";

      expect(el.numberReflect).toBe(0);
      el.numberReflect = 1;

      el.undefinedReflect = "test";

      document.body.appendChild(el);

      return resolveRaf(() => {
        expect(el.getAttribute("prop1")).toBe(null);
        expect(el.getAttribute("prop2")).toBe(null);
        expect(el.getAttribute("prop3")).toBe("");
        expect(el.getAttribute("prop4")).toBe("test 2");
        expect(el.getAttribute("not-defined")).toBe(null);

        expect(el.getAttribute("string-reflect")).toBe(null);
        expect(el.getAttribute("number-reflect")).toBe("1");
        expect(el.getAttribute("undefined-reflect")).toBe("test");

        el.undefinedReflect = undefined;

        return resolveRaf(() => {
          expect(el.getAttribute("undefined-reflect")).toBe(null);
        });
      });
    });

    it("does not update property when attribute changes", () => {
      document.body.appendChild(el);

      el.setAttribute("prop-1", "abc");
      el.setAttribute("prop-2", "200");

      return resolveRaf(() => {
        expect(el.prop1).toBe("default");
        expect(el.prop2).toBe(0);
      });
    });

    it("calls observe method", () => {
      observeSpy = jasmine.createSpy("observe");
      el = document.createElement("test-define-default");
      document.body.appendChild(el);

      expect(observeSpy).toHaveBeenCalledTimes(0);

      return resolveRaf(() => {
        expect(observeSpy).toHaveBeenCalledTimes(0);
        el.prop5 = "a";

        return resolveRaf(() => {
          expect(observeSpy).toHaveBeenCalledTimes(1);
          expect(observeSpy).toHaveBeenCalledWith(el, "a", undefined);
          el.prop5 = "b";

          return resolveRaf(() => {
            expect(observeSpy).toHaveBeenCalledTimes(2);
            expect(observeSpy).toHaveBeenCalledWith(el, "b", "a");
          });
        });
      });
    });

    it("calls custom connect method once", () => {
      spy = jasmine.createSpy("define");
      el = document.createElement("test-define-default");

      expect(spy).toHaveBeenCalledTimes(0);
      document.body.appendChild(el);

      const fragment = document.createDocumentFragment();
      fragment.appendChild(el);
      document.body.appendChild(el);

      return Promise.resolve().then(() => {
        expect(spy).toHaveBeenCalledTimes(1);

        return resolveRaf(() => {
          expect(spy).toHaveBeenCalledTimes(1);
          el.prop3 = true;
          return resolveRaf(() => {
            expect(spy).toHaveBeenCalledTimes(1);
            expect(el.getAttribute("prop3")).toBe("");
          });
        });
      });
    });

    it("renders to shadowRoot", () => {
      document.body.appendChild(el);
      expect(el.shadowRoot).toBe(null);

      return resolveRaf(() => {
        expect(el.shadowRoot.innerHTML).toBe("<div>default</div>");
        el.prop1 = "a";

        return resolveRaf(() => {
          expect(el.shadowRoot.innerHTML).toBe("<div>a</div>");
        });
      });
    });

    it("calls observe method of the render property", () => {
      const spy = jasmine.createSpy("observe");
      define({
        tag: "test-define-render-observe",
        render: {
          value: () => html`<div></div>`,
          observe: spy,
        },
      });

      el = document.createElement("test-define-render-observe");
      document.body.appendChild(el);

      return resolveRaf(() => {
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    it("uses property options for render in shadowRoot", () => {
      define({
        tag: "test-define-render-options",
        render: {
          options: { delegatesFocus: true },
          value: () => html` <div>test</div>`,
        },
      });

      el = document.createElement("test-define-render-options");
      document.body.appendChild(el);

      el.attachShadow = jasmine.createSpy("attachShadow");

      return resolveRaf(() => {
        expect(el.attachShadow).toHaveBeenCalledOnceWith({
          mode: "open",
          delegatesFocus: true,
        });
      });
    });

    it("calls observe method for render property", () => {
      const spy = jasmine.createSpy("observe");
      define({
        tag: "test-define-render-observe",
        render: {
          value: () => html`<div></div>`,
          observe: spy,
        },
      });

      el = document.createElement("test-define-render-observe");
      document.body.appendChild(el);

      return resolveRaf(() => {
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    it("puts content to children", () => {
      document.body.appendChild(el);
      expect(el.innerHTML).toBe("");

      return resolveRaf(() => {
        expect(el.innerHTML).toBe("<div>default</div>");
        el.prop1 = "a";

        return resolveRaf(() => {
          expect(el.innerHTML).toBe("<div>a</div>");
        });
      });
    });
  });

  describe("from() method", () => {
    it("returns early if map of modules is empty", () => {
      const components = {};
      expect(define.from(components)).toBe(components);
    });

    it("defines elements from a map of modules with paths", () => {
      const component = {};

      define.from({
        "./test/define-from.js": component,
      });

      expect(component.tag).toBe("test-define-from");
      expect(customElements.get("test-define-from")).toBeDefined();
    });

    it("defines elements clearing out the root", () => {
      const components = {
        "./asdf/test/DefineFromRoot.js": {},
      };

      expect(define.from(components, { root: "./asdf" })).toBe(components);
      expect(customElements.get("test-define-from-root")).toBeDefined();
    });

    it("defines elements with custom prefix", () => {
      define.from(
        {
          "/test/defineFrom.js": {},
        },
        { prefix: "asdf" },
      );

      expect(customElements.get("asdf-test-define-from")).toBeDefined();
    });

    it("defines elements with custom tag from the definition", () => {
      define.from(
        {
          "/test/define-from.js": { tag: "test-define-from-custom" },
        },
        { prefix: "asdf" },
      );

      expect(customElements.get("test-define-from-custom")).toBeDefined();
    });
  });
});

import { define, html } from "../../src/index.js";
import { resolveRaf } from "../helpers.js";

describe("define:", () => {
  let el;
  let spy;

  afterEach(() => {
    if (el && el.parentElement) el.parentElement.removeChild(el);
  });

  it("throws when 'tag' property is missing", () => {
    expect(() => {
      define({ prop1: "value1" });
    }).toThrow();
    expect(() => {
      define({ tag: null, prop1: "value1" });
    }).not.toThrow();
  });

  it("throws when another external element is defined on the same tag name", () => {
    customElements.define("test-define-external", class extends HTMLElement {});
    expect(() => {
      define({ tag: "test-define-external", prop1: "value1" });
    }).toThrow();
  });

  it("throws for unsupported property value", () => {
    expect(() => {
      define({
        tag: "test-define-throws",
        prop: Symbol("asd"),
      });
    }).toThrow();
  });

  it("throws for unsupported property option", () => {
    expect(() => {
      define({
        tag: "test-define-throws",
        prop: {
          get: () => {},
        },
      });
    }).toThrow();
  });

  it("throws for not required descriptor form", () => {
    expect(() => {
      define({
        tag: "test-define-throws",
        prop: {
          value: 1,
        },
      });
    }).toThrow();
  });

  it("returns passed hybrids if the tag name is defined", () => {
    const hybrids = { tag: "test-define-twice" };
    expect(define(hybrids)).toBe(hybrids);
    expect(define(hybrids)).toBe(hybrids);
  });

  it("returns class constructor when tag name is null", () => {
    expect(define({ tag: null, some: "" })).toBeInstanceOf(Function);
  });

  it("redefines the same element", () => {
    define({
      tag: "test-define-same-deep",
      prop: "test",
    });

    define({
      tag: "test-define-same",
      prop1: "test",
      render: () =>
        html`
          <test-define-same-deep></test-define-same-deep>
        `,
    });

    el = document.createElement("test-define-same");
    document.body.appendChild(el);

    return resolveRaf(() => {
      define({
        tag: "test-define-same",
        prop2: "test",
        render: () =>
          html`
            <test-define-same-deep></test-define-same-deep>
          `,
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

    expect(el.prop).toBe(0);
    expect(el.otherProp).toBe(0);
    expect(el.otherProp).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);

    ref();
    expect(el.otherProp).toBe(0);
    expect(spy).toHaveBeenCalledTimes(1);

    ref({ force: true });
    expect(el.otherProp).toBe(0);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  describe("created element", () => {
    beforeAll(() => {
      define({
        tag: "test-define-default",
        prop1: "",
        prop2: 0,
        prop3: {
          value: false,
          connect: (...args) => spy && spy(...args),
          observe: (...args) => spy && spy(...args),
        },
        prop4: ["a", "b", "c"],
        computed: ({ prop2, prop3 }) => `${prop2} ${prop3}`,
        fullDesc: () => "fullDesc",
        fullDescWritable: (host, val) => (val ? val * 2 : 0),
        fullDescReadonly: {
          value: (host, val) => (val ? val * 2 : 0),
          writable: false,
        },
        undefinedProp: undefined,
        render: ({ prop1 }) =>
          html`<div>${prop1}</div>`, // prettier-ignore
        content: ({ prop1 }) =>
          html`<div>${prop1}</div>` // prettier-ignore
      });
    });

    beforeEach(() => {
      el = document.createElement("test-define-default");
    });

    it("returns an element with defined properties", () => {
      expect(el.prop1).toBe("");
      expect(el.prop2).toBe(0);
      expect(el.prop3).toBe(false);
      expect(el.computed).toBe("0 false");
      expect(el.fullDesc).toBe("fullDesc");
      expect(el.fullDescWritable).toBe(0);
      expect(el.undefinedProp).toBe(undefined);
    });

    it("sets values from corresponding attributes", () => {
      el.setAttribute("prop1", "a");
      el.setAttribute("prop2", "2");
      el.setAttribute("prop3", "");
      el.setAttribute("prop4", "b");
      el.setAttribute("undefined-prop", "c");

      expect(el.prop1).toBe("a");
      expect(el.prop2).toBe(2);
      expect(el.prop3).toBe(true);
      expect(el.prop4).toEqual(["b"]);
      expect(el.undefinedProp).toBe("c");
    });

    it("updates writable properties", () => {
      el.prop1 = "a";
      expect(el.prop1).toBe("a");

      el.prop2 = "1";
      expect(el.prop2).toBe(1);

      el.prop3 = "true";
      expect(el.prop3).toBe(true);

      el.prop4 = false;
      expect(el.prop4).toEqual([]);

      el.prop4 = "a s d";
      expect(el.prop4).toEqual(["a", "s", "d"]);

      el.prop4 = ["d", "e", "f"];
      expect(el.prop4).toEqual(["d", "e", "f"]);

      el.fullDescWritable = 1;
      expect(el.fullDescWritable).toBe(2);

      el.undefinedProp = {};
      expect(el.undefinedProp).toEqual({});

      document.body.appendChild(el);

      return resolveRaf(() => {
        expect(el.getAttribute("prop1")).toBe("a");
        expect(el.getAttribute("prop2")).toBe("1");
        expect(el.getAttribute("prop3")).toBe("");
        expect(el.getAttribute("prop4")).toBe("d e f");
      });
    });

    it("throws when updating readonly computed property", () => {
      expect(() => {
        el.computed = "a";
      }).toThrow();
      expect(() => {
        el.fullDesc = "a";
      }).toThrow();
    });

    it("throws when assert readonly full description", () => {
      expect(el.fullDescReadonly).toBe(0);
      expect(() => {
        el.fullDescReadonly = 1;
      }).toThrow();
    });

    it("sets corresponding attribute value for primitives properties", () => {
      document.body.appendChild(el);

      return resolveRaf(() => {
        expect(el.getAttribute("prop1")).toBe(null);
        expect(el.getAttribute("prop2")).toBe("0");
        expect(el.getAttribute("prop3")).toBe(null);
        expect(el.getAttribute("prop4")).toBe("a b c");
      });
    });

    it("calls custom connect and observe methods", () => {
      spy = jasmine.createSpy("define");
      el = document.createElement("test-define-default");

      expect(spy).toHaveBeenCalledTimes(0);
      document.body.appendChild(el);
      expect(spy).toHaveBeenCalledTimes(1);

      return resolveRaf(() => {
        expect(spy).toHaveBeenCalledTimes(2);
        el.prop3 = true;
        return resolveRaf(() => {
          expect(spy).toHaveBeenCalledTimes(3);
          expect(spy.calls.mostRecent().args).toEqual([el, true, false]);
        });
      });
    });

    it("renders to shadowRoot", () => {
      document.body.appendChild(el);
      expect(el.shadowRoot).toBe(null);

      return resolveRaf(() => {
        expect(el.shadowRoot.innerHTML).toBe("<div></div>");
        el.prop1 = "a";

        return resolveRaf(() => {
          expect(el.shadowRoot.innerHTML).toBe("<div>a</div>");
        });
      });
    });

    it("uses fn options for render in shadowRoot", () => {
      define({
        tag: "test-define-render-options",
        render: Object.assign(
          () =>
            html`
              <div>test</div>
            `,
          { delegatesFocus: true },
        ),
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

    it("puts content to children", () => {
      document.body.appendChild(el);
      expect(el.innerHTML).toBe("");

      return resolveRaf(() => {
        expect(el.innerHTML).toBe("<div></div>");
        el.prop1 = "a";

        return resolveRaf(() => {
          expect(el.innerHTML).toBe("<div>a</div>");
        });
      });
    });
  });
});

import { test, resolveRaf } from "../helpers.js";
import define from "../../src/define.js";
import property from "../../src/property.js";

describe("property:", () => {
  const objProp = {};

  define("test-property", {
    stringProp: property("value"),
    numberProp: property(123),
    boolProp: property(false),
    funcProp: property(value => ({
      value,
    })),
    objProp: property(objProp),
    nullProp: property(null),
    undefinedProp: property(undefined),
  });

  const empty = test(`
    <test-property></test-property>
  `);

  describe("fallback order", () => {
    const tree = test(`
      <test-property string-prop="default value"></test-property>
    `);

    it(
      "uses value from configuration",
      empty(el => {
        expect(el.stringProp).toBe("value");
      }),
    );

    it(
      "uses host attribute",
      tree(el => {
        expect(el.stringProp).toBe("default value");
      }),
    );

    it(
      "uses host empty attribute",
      test(`
      <test-property string-prop=""></test-property>
    `)(el => {
        expect(el.stringProp).toBe("");
      }),
    );

    it(
      "uses host attribute value only once",
      tree(el => {
        const parent = el.parentElement;

        el.stringProp = "new value";
        parent.removeChild(el);

        return new Promise(resolve => {
          parent.appendChild(el);

          Promise.resolve().then(() => {
            expect(el.stringProp).toBe("new value");
            resolve();
          });
        });
      }),
    );

    it("uses property over attribute", () =>
      tree(el => {
        el.stringProp = "new value";
        expect(el.stringProp).toBe("new value");
      }));

    it(
      "uses property from the host, before it is upgraded",
      test(`<test-property-upgrade></test-property-upgrade>`)(el => {
        el.value = "test";
        define("test-property-upgrade", { value: property("") });
        expect(el.value).toBe("test");
        el.value = 5;
        expect(el.value).toBe("5");
      }),
    );

    it("updates attribute value from primitive types", () =>
      empty(el => {
        el.stringProp = "test";
        el.boolProp = true;
        el.numberProp = 0;
        return resolveRaf(() => {
          expect(el.getAttribute("string-prop")).toBe("test");
          expect(el.hasAttribute("bool-prop")).toBe(true);
          expect(el.getAttribute("bool-prop")).toBe("");
          expect(el.getAttribute("number-prop")).toBe("0");
        });
      }));
  });

  describe("string type", () => {
    it("transforms values to string", () =>
      empty(el => {
        el.stringProp = 123;
        expect(el.stringProp).toBe("123");
      }));
  });

  describe("number type", () => {
    const tree = test(`
      <test-property number-prop="321"></test-property>
    `);

    it(
      "transforms attribute to number",
      tree(el => {
        expect(el.numberProp).toBe(321);
      }),
    );

    it(
      "transforms empty attribute to zero",
      test(`
      <test-property number-prop=""></test-property>
    `)(el => {
        expect(el.numberProp).toBe(0);
      }),
    );

    it(
      "transforms property to number",
      empty(el => {
        el.numberProp = "321";
        expect(el.numberProp).toBe(321);
      }),
    );
  });

  describe("boolean type", () => {
    const tree = test(`
      <test-property bool-prop></test-property>
    `);

    it("transforms not present attribute to boolean", done => {
      empty(el => {
        expect(el.boolProp).toBe(false);
      })(done);
    });

    it("transforms attribute to boolean", done => {
      tree(el => {
        expect(el.boolProp).toBe(true);
      })(done);
    });

    it(
      "transforms property to boolean",
      empty(el => {
        el.boolProp = "value";
        expect(el.boolProp).toBe(true);

        el.boolProp = "";
        expect(el.boolProp).toBe(false);
      }),
    );
  });

  describe("function type", () => {
    const tree = test(`
      <test-property func-prop="test value"></test-property>
    `);

    it("transforms attribute with function", () => {
      empty(el => {
        expect(el.funcProp).toEqual({
          value: undefined,
        });
      });

      tree(el => {
        expect(el.funcProp).toEqual({
          value: "test value",
        });
      });
    });

    it(
      "transforms property with function",
      empty(el => {
        el.funcProp = false;
        expect(el.funcProp).toEqual({
          value: false,
        });
      }),
    );
  });

  describe("object type", () => {
    const tree = test(`
      <test-property obj-prop="asd"></test-property>
    `);

    it(
      "does not transform attribute",
      tree(el => {
        expect(el.objProp).toBe(objProp);
      }),
    );

    it(
      "set object value",
      empty(el => {
        const value = {};
        el.objProp = value;
        expect(el.objProp).toBe(value);

        el.objProp = null;
        expect(el.objProp).toBe(null);
      }),
    );

    it(
      "throws when set with other type than object",
      empty(el => {
        expect(() => {
          el.objProp = false;
        }).toThrow();
      }),
    );
  });

  describe("null & undefined", () => {
    const tree = test(`
      <test-property null-prop="test value" undefined-prop="test value"></test-property>
    `);

    it(
      "does not transform attribute",
      empty(el => {
        expect(el.nullProp).toBe(null);
        expect(el.undefinedProp).toBe(undefined);
      }),
    );
    it(
      "does not transform attribute",
      tree(el => {
        expect(el.nullProp).toBe(null);
        expect(el.undefinedProp).toBe(undefined);
      }),
    );

    it(
      "passes null property without transform",
      empty(el => {
        const obj = {};
        el.nullProp = obj;
        expect(el.nullProp).toBe(obj);
      }),
    );

    it(
      "passes undefined property without transform",
      empty(el => {
        el.undefinedProp = false;
        expect(el.undefinedProp).toBe(false);

        const obj = {};
        el.undefinedProp = obj;
        expect(el.undefinedProp).toBe(obj);
      }),
    );
  });

  describe("connect option", () => {
    it("is called", done => {
      const spy = jasmine.createSpy("connect");
      define("test-property-connect", {
        prop: property(0, spy),
      });

      test("<test-property-connect></test-property-connect>")(() =>
        expect(spy).toHaveBeenCalledTimes(1),
      )(done);
    });
  });
});

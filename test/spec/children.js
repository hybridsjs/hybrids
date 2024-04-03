import { test, resolveRaf, resolveTimeout } from "../helpers.js";
import define from "../../src/define.js";
import children from "../../src/children.js";
import { html } from "../../src/template/index.js";

describe("children:", () => {
  let child;
  let tree;

  beforeAll(() => {
    child = {
      tag: "test-children-child",
      customName: "",
    };
    define(child);
  });

  describe("direct children", () => {
    tree = test(`
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

    beforeAll(() => {
      define({
        tag: "test-children-direct",
        direct: children(child),
        customName: ({ direct }) => direct && direct[0] && direct[0].customName,
        render: ({ customName }) => html` ${customName} `,
      });
    });

    it(
      "returns list",
      tree((el) => {
        expect(el.direct).toEqual([el.children[0], el.children[1]]);
      }),
    );

    it(
      "removes item from list",
      tree((el) => {
        el.removeChild(el.children[1]);

        return resolveRaf(() => {
          expect(el.direct).toEqual([
            jasmine.objectContaining({ customName: "one" }),
          ]);
        });
      }),
    );

    it(
      "adds item to list",
      tree((el) => {
        const newItem = document.createElement("test-children-child");
        newItem.customName = "four";

        el.appendChild(newItem);

        return resolveRaf(() => {
          expect(el.direct).toEqual([
            jasmine.objectContaining({ customName: "one" }),
            jasmine.objectContaining({ customName: "two" }),
            jasmine.objectContaining({ customName: "four" }),
          ]);
        });
      }),
    );

    it(
      "reorder list items",
      tree((el) => {
        el.insertBefore(el.children[1], el.children[0]);

        return resolveRaf(() => {
          expect(el.direct).toEqual([
            jasmine.objectContaining({ customName: "two" }),
            jasmine.objectContaining({ customName: "one" }),
          ]);
        });
      }),
    );

    it(
      "updates parent computed property",
      tree((el) =>
        resolveTimeout(() => {
          expect(el.customName).toBe("one");
          el.children[0].customName = "four";

          return resolveRaf(() => {
            expect(el.shadowRoot.innerHTML.trim()).toBe("four");
          });
        }),
      ),
    );
  });

  describe("function condition", () => {
    tree = test(`
      <test-children-fn>
        <test-children-child></test-children-child>
      </test-children-fn>
    `);

    beforeAll(() => {
      define({
        tag: "test-children-fn",
        direct: children((hybrids) => hybrids === child),
      });
    });

    it(
      "returns item list",
      tree((el) => {
        expect(el.direct.length).toBe(1);
        expect(el.direct[0]).toBe(el.children[0]);
      }),
    );
  });

  describe("context defined children", () => {
    tree = test(`
      <test-children-fn>
        <test-children-child></test-children-child>
      </test-children-fn>
    `);

    beforeAll(() => {
      define({
        tag: "test-children-fn",
        childTag: "test-children-child",
        direct: children((hybrids, { childTag }) => hybrids.tag === childTag),
      });
    });

    it(
      "returns the correct child element",
      tree((el) => {
        expect(el.direct.length).toBe(1);
        expect(el.direct[0]).toBe(el.children[0]);
      }),
    );

    it(
      "updates the children when the host changes",
      tree((el) => {
        el.childTag = "tag-does-not-exist";
        expect(el.direct.length).toBe(0);
      }),
    );
  });

  describe("deep children", () => {
    tree = test(`
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

    beforeAll(() => {
      define({
        tag: "test-children-deep",
        deep: children(child, { deep: true }),
      });
    });

    it(
      "returns item list",
      tree((el) => {
        expect(el.deep).toEqual([
          jasmine.objectContaining({ customName: "one" }),
          jasmine.objectContaining({ customName: "two" }),
          jasmine.objectContaining({ customName: "three" }),
        ]);
      }),
    );

    it(
      "removes item from list",
      tree((el) => {
        el.children[2].innerHTML = "";

        return resolveRaf(() => {
          expect(el.deep).toEqual([
            jasmine.objectContaining({ customName: "one" }),
            jasmine.objectContaining({ customName: "two" }),
          ]);
        });
      }),
    );

    it(
      "does not update if other children element is invalidated",
      tree((el) =>
        resolveRaf(() => {
          el.children[0].children[0].customName = "test";
          return resolveRaf(() => {
            expect(el.deep).toEqual([
              jasmine.objectContaining({ customName: "one" }),
              jasmine.objectContaining({ customName: "two" }),
              jasmine.objectContaining({ customName: "three" }),
            ]);
          });
        }),
      ),
    );
  });

  describe("nested children", () => {
    tree = test(`
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

    beforeAll(() => {
      define({
        tag: "test-children-nested",
        nested: children(child, { deep: true, nested: true }),
      });
    });

    it(
      "returns item list",
      tree((el) => {
        expect(el.nested).toEqual([
          jasmine.objectContaining({ customName: "one" }),
          jasmine.objectContaining({ customName: "five" }),
          jasmine.objectContaining({ customName: "two" }),
          jasmine.objectContaining({ customName: "three" }),
        ]);
      }),
    );

    it(
      "removes item from list",
      tree((el) => {
        el.children[0].innerHTML = "";

        return resolveRaf(() => {
          expect(el.nested).toEqual([
            jasmine.objectContaining({ customName: "one" }),
            jasmine.objectContaining({ customName: "two" }),
            jasmine.objectContaining({ customName: "three" }),
          ]);
        });
      }),
    );
  });

  describe("dynamic children", () => {
    let TestDynamicChild;

    beforeAll(() => {
      TestDynamicChild = define({
        tag: "test-dynamic-child",
        name: "",
      });

      define({
        tag: "test-dynamic-parent",
        items: children(TestDynamicChild),
        render: ({ items }) => html`
          <div>
            ${items.map(({ name }) => html` <div>${name}</div> `.key(name))}
          </div>
          <slot></slot>
        `,
      });

      define({
        tag: "test-dynamic-wrapper",
        items: undefined,
        render: ({ items }) => html`
          <test-dynamic-parent>
            <test-dynamic-child name="one"></test-dynamic-child>
            ${items &&
            items.map((name) =>
              html`
                <test-dynamic-child name="${name}"></test-dynamic-child>
              `.key(name),
            )}
          </test-dynamic-parent>
        `,
      });
    });

    tree = test(`
      <test-dynamic-wrapper></test-dynamic-wrapper>
    `);

    it(
      "adds dynamic item",
      tree((el) =>
        resolveTimeout(() => {
          el.items = ["two"];
          return resolveTimeout(() => {
            expect(
              el.shadowRoot.children[0].shadowRoot.children[0].children.length,
            ).toBe(2);
          });
        }),
      ),
    );
  });
});

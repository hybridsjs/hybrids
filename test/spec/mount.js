import { mount, html } from "../../src/index.js";
import { resolveRaf } from "../helpers.js";

describe("mount:", () => {
  let target;

  beforeEach(() => {
    target = document.createElement("div");
    document.body.appendChild(target);
  });

  afterEach(() => {
    document.body.removeChild(target);
  });

  it("mounts hybrids element to target element", () => {
    mount(target, {
      value: 1,
      content: ({ value }) => html`<div>${value}</div>`,
    });

    return resolveRaf(() => {
      expect(target.innerHTML).toBe("<div>1</div>");
    });
  });

  it("replaces hybrids with new hybrids", () => {
    mount(target, {
      value: 1,
      test: "value",
      content: ({ value }) => html`<div>${value}</div>`,
    });

    return resolveRaf(() => {
      mount(target, {
        test: "hello",
        content: (host) => html`<div>${host.test}</div>`,
      });

      return resolveRaf(() => {
        expect(target.innerHTML).toBe("<div>hello</div>");
        expect(Object.hasOwn(target, "value")).toBe(false);
        expect(Object.hasOwn(target, "test")).toBe(true);
      });
    });
  });

  it("returns eagerly if hybrids are the same", () => {
    const spy = jasmine.createSpy();
    const hybrids = {
      value: 1,
      content: ({ value }) => {
        spy();
        return html`<div>${value}</div>`;
      },
    };

    mount(target, hybrids);

    return resolveRaf(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      mount(target, hybrids);

      return resolveRaf(() => {
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });
  });
});

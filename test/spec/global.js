import global, { polyfill } from "../../src/global.js";

describe("global:", () => {
  it("exports window in browser context", () => {
    expect(global).toBe(window);
  });

  describe("polyfill -", () => {
    it("uses required APIs from the context", () => {
      const global = polyfill(window);

      expect(global).not.toBe(window);
      expect(global.requestAnimationFrame).toBe(window.requestAnimationFrame);
      expect(global.HTMLElement).toBe(window.HTMLElement);
    });

    it("adds HTMLElement class and requestAnimationFrame to other contexts", () => {
      const global = polyfill({});

      expect(global.HTMLElement).toBeDefined();
      expect(() => {
        new global.HTMLElement();
      }).toThrow();

      expect(global.document).toBeDefined();
      expect(() => {
        global.document.importNode();
      }).toThrow();
    });
  });
});

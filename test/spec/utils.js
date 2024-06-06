import { walkInShadow } from "../../src/utils.js";

describe("utils", () => {
  describe("walkInShadow", () => {
    it("calls callback for each node in shadow root", () => {
      const callback = jasmine.createSpy();
      const root = document.createElement("div");
      const shadow = root.attachShadow({ mode: "open" });
      const child = document.createElement("div");

      shadow.appendChild(child);
      walkInShadow(root, callback);

      expect(callback).toHaveBeenCalledWith(root);
      expect(callback).toHaveBeenCalledWith(child);
    });
  });
});

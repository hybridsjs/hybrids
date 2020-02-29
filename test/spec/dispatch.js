import { dispatch } from "../../src/utils.js";

describe("dispatch:", () => {
  let fragment;
  let spy;
  beforeEach(() => {
    spy = jasmine.createSpy();
    fragment = document.createElement("div");
  });

  it("dispatches custom event", () => {
    fragment.addEventListener("custom-event", spy);
    dispatch(fragment, "custom-event");
    expect(spy).toHaveBeenCalled();
  });

  it("passes details", () => {
    fragment.addEventListener("custom-event", spy);
    dispatch(fragment, "custom-event", { detail: "test" });
    expect(spy.calls.first().args[0].detail).toBe("test");
  });
});

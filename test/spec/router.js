import { define, dispatch, router } from "../../src/index.js";

describe("router:", () => {
  let el;
  let spy;
  let prop;
  let disconnect;
  let href;

  function navigate(url) {
    dispatch(el, "navigate", { detail: { url } });
  }

  beforeEach(() => {
    el = document.createElement("div");
    spy = jasmine.createSpy();

    href = window.location.href;
    window.history.replaceState(null, "");
  });

  afterEach(() => {
    if (disconnect) {
      disconnect();
      disconnect = null;
    }

    window.history.replaceState(null, "", href);
  });

  describe("root router", () => {
    const Home = define("test-router-home", {});
    const One = define("test-router-one", {
      [router.connect]: {
        url: "/one",
      },
    });
    const Two = define("test-router-two", {});
    const Dialog = define("test-router-dialog", {
      [router.connect]: {
        dialog: true,
      },
    });
    const views = [Home, One, Two, Dialog];

    beforeEach(() => {
      prop = router(views);
    });

    it("returns a default view", () => {
      disconnect = prop.connect(el, "", spy);

      const list = prop.get(el);

      expect(list).toBeInstanceOf(Array);
      expect(list[0]).toBeInstanceOf(Home);
    });

    it("returns a view by matching URL", () => {
      window.history.replaceState(null, "", "/one");

      disconnect = prop.connect(el, "", spy);
      const list = prop.get(el);

      expect(list).toBeInstanceOf(Array);
      expect(list[0]).toBeInstanceOf(One);
    });

    it("sets a view to window history", () => {
      disconnect = prop.connect(el, "", spy);
      expect(window.history.state).toBeInstanceOf(Array);
      expect(window.history.state.length).toBe(1);
    });

    it("returns a view saved in window history", () => {
      window.history.replaceState([{ id: "test-router-two", params: {} }], "");
      disconnect = prop.connect(el, "", spy);
      const list = prop.get(el);

      expect(list).toBeInstanceOf(Array);
      expect(list[0]).toBeInstanceOf(Two);
    });

    it("returns a default view when saved view is not found", () => {
      window.history.replaceState(
        [{ id: "test-router-some-other", params: {} }],
        "",
      );
      disconnect = prop.connect(el, "", spy);
      const list = prop.get(el);

      expect(list).toBeInstanceOf(Array);
      expect(list[0]).toBeInstanceOf(Home);
    });

    it("goes back when dialog element is on the top of the stack", done => {
      window.history.replaceState([{ id: "test-router-two", params: {} }], "");
      window.history.pushState(
        [
          { id: "test-router-dialog", params: {} },
          { id: "test-router-two", params: {} },
        ],
        "",
      );

      disconnect = prop.connect(el, "", () => {
        const list = prop.get(el);

        expect(list).toBeInstanceOf(Array);
        expect(list[0]).toBeInstanceOf(Two);
        done();
      });
    });

    it("does not go back for dialog view when reconnecting (HMR)", done => {
      disconnect = prop.connect(el, "", spy);
      navigate(router.url(Dialog));

      disconnect();

      disconnect = prop.connect(el, "", () => {
        const list = prop.get(el);
        expect(list[1]).toBeInstanceOf(Element);
        expect(list[1]).toBeInstanceOf(Dialog);
        done();
      });
    });
  });

  describe("[router.connect] -", () => {
    describe("'dialog'", () => {
      it("pushes new entry for dialog view");
      it("pushes new entry for dialog not from the stack ???");
    });

    describe("'url'", () => {});

    describe("'multiple'", () => {
      describe("when 'true'", () => {
        it(
          "navigate pushes new entry for the same id when other params with multiple option is set",
        );
        it("navigate moves back to entry where params are equal");
      });
      describe("when 'false'", () => {
        it("replaces state for the same view");
      });
    });

    describe("'guard'", () => {
      it("displays guard parent when condition is not met");
      it("displays the first view from own stack when condition is met");
    });

    describe("'stack'", () => {
      describe("for view from own stack", () => {
        it("pushes new entry for view from stack");
        it("moves back to the view from stack");
      });

      describe("for view not from own stack", () => {
        it("finds a common parent, clears stack, and pushes new state");
      });
    });
  });

  describe("view layout", () => {
    it("saves scroll positions");
    it("saves the latest focused element");
  });
});

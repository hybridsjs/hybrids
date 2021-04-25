import { dispatch, router } from "../../src/index.js";

fdescribe("router:", () => {
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

  describe("for root router", () => {
    const views = {
      Home: {},
      One: {
        [router.connect]: {
          url: "/one",
        },
      },
      Two: {},
      Dialog: {
        [router.connect]: {
          dialog: true,
        },
      },
    };

    describe("connected root router", () => {
      beforeEach(() => {
        prop = router(views);
      });

      it("throws for wrong first argument", () => {
        expect(() => {
          router();
        }).toThrow();
        expect(() => {
          router({});
        }).toThrow();
      });

      it("returns a default view", () => {
        disconnect = prop.connect(el, "", spy);

        const list = prop.get(el);

        expect(list).toBeInstanceOf(Array);
        expect(list[0]).toBeInstanceOf(Element);
        expect(list[0].constructor.hybrids).toBe(views.Home);
      });

      it("returns a view by matching URL", () => {
        window.history.replaceState(null, "", "/one");

        disconnect = prop.connect(el, "", spy);
        const list = prop.get(el);

        expect(list).toBeInstanceOf(Array);
        expect(list[0]).toBeInstanceOf(Element);
        expect(list[0].constructor.hybrids).toBe(views.One);
      });

      it("sets a view to window history", () => {
        disconnect = prop.connect(el, "", spy);
        expect(window.history.state).toBeInstanceOf(Array);
        expect(window.history.state.length).toBe(1);
      });

      it("returns a view saved in window history", () => {
        window.history.replaceState([{ id: "view-two", params: {} }], "");
        disconnect = prop.connect(el, "", spy);
        const list = prop.get(el);

        expect(list).toBeInstanceOf(Array);
        expect(list[0]).toBeInstanceOf(Element);
        expect(list[0].constructor.hybrids).toBe(views.Two);
      });

      it("returns a default view when saved view is not found", () => {
        window.history.replaceState(
          [{ id: "view-some-other", params: {} }],
          "",
        );
        disconnect = prop.connect(el, "", spy);
        const list = prop.get(el);

        expect(list).toBeInstanceOf(Array);
        expect(list[0]).toBeInstanceOf(Element);
        expect(list[0].constructor.hybrids).toBe(views.Home);
      });

      it("goes back when dialog element is on the top of the stack", done => {
        window.history.replaceState([{ id: "view-two", params: {} }], "");
        window.history.pushState(
          [
            { id: "view-dialog", params: {} },
            { id: "view-two", params: {} },
          ],
          "",
        );

        disconnect = prop.connect(el, "", () => {
          const list = prop.get(el);

          expect(list).toBeInstanceOf(Array);
          expect(list[0]).toBeInstanceOf(Element);
          expect(list[0].constructor.hybrids).toBe(views.Two);
          done();
        });
      });

      it("does not go back for dialog view when reconnecting (HMR)", done => {
        disconnect = prop.connect(el, "", spy);
        navigate(router.url(views.Dialog));

        disconnect();

        disconnect = prop.connect(el, "", () => {
          const list = prop.get(el);
          expect(list[1]).toBeInstanceOf(Element);
          expect(list[1].constructor.hybrids).toBe(views.Dialog);
          done();
        });
      });
    });
  });

  describe("[router.connect] -", () => {
    describe("'dialog'", () => {
      it("pushes new state for dialog view");
      it("pushes new state for dialog not from the stack ???");
    });

    describe("'url'", () => {});

    describe("'multiple'", () => {
      describe("when 'true'", () => {
        it(
          "navigate pushes new state for the same id when other params with multiple option is set",
        );
        it("navigate moves back to state where params are equal");
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
        it("pushes new state for view from stack");
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

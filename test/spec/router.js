import { define, html, router } from "../../src/index.js";
import { constructors } from "../../src/define.js";
import { resolveTimeout } from "../helpers.js";

function hybrids(el) {
  return constructors.get(el.constructor);
}

const browserUrl = window.location.pathname;

describe("router:", () => {
  let ChildView;
  let OtherChildView;
  let OtherChildWithLongerUrl;
  let OtherChildWithSharedUrl;
  let NestedViewOne;
  let NestedViewTwo;
  let Dialog;
  let Dialog2;
  let MultipleView;
  let MultipleViewWithUrl;
  let host;
  let RootView;

  afterAll(() => {
    window.history.replaceState(null, "", browserUrl);
  });

  it("throws for wrong arguments", () => {
    const el = document.createElement("div");
    expect(() => router().connect(el)).toThrow();
    expect(() => router(() => "test").connect(el)).toThrow();
  });

  it("throws when views have circular reference", () => {
    let A;

    const B = define({
      [router.connect]: { stack: () => [A] },
      tag: "test-router-circular-b",
    });

    A = define({
      [router.connect]: { stack: [B] },
      tag: "test-router-circular-a",
    });

    const el = document.createElement("div");
    expect(() => router([A]).connect(el)).toThrow();
  });

  it("throws when view is not defined", () => {
    const NotDefine = { tag: "test-router-not-define" };
    expect(() => {
      router([NotDefine]).connect(document.createElement("div"));
    }).toThrow();
  });

  it("throws when dialog has 'url' option", () => {
    expect(() =>
      router([
        define({
          [router.connect]: { dialog: true, url: "/home" },
          tag: "test-router-dialog-throw",
        }),
      ]).connect(document.createElement("div")),
    ).toThrow();
  });

  it("throws when view 'url' option is not a string", () => {
    expect(() =>
      router([
        define({
          [router.connect]: { url: true },
          tag: "test-router-url-throw",
        }),
      ]).connect(document.createElement("div")),
    ).toThrow();
  });

  it("throws when dialog has 'stack' option", () => {
    expect(() =>
      router([
        define({
          [router.connect]: { dialog: true, stack: [] },
          tag: "test-router-dialog-throw",
        }),
      ]).connect(document.createElement("div")),
    ).toThrow();
  });

  it("throws when view does not support browser url option", () => {
    expect(() =>
      router([
        define({
          [router.connect]: { url: "/test?open" },
          tag: "test-router-url-throw",
        }),
      ]).connect(document.createElement("div")),
    ).toThrow();
  });

  it("throws when url option duplicates parameter in pathname", () => {
    expect(() =>
      router([
        define({
          [router.connect]: { url: "/test/:asd/:asd" },
          tag: "test-router-url-throw",
        }),
      ]).connect(document.createElement("div")),
    ).toThrow();
  });

  it("throws when url option duplicates parameter in search params", () => {
    expect(() =>
      router([
        define({
          [router.connect]: { url: "/test/:asd?asd" },
          tag: "test-router-url-throw",
        }),
      ]).connect(document.createElement("div")),
    ).toThrow();
  });

  it("throws for more than one nested router in the definition", () => {
    const NestedView = define({ tag: "test-router-nested-root-nested-view" });
    define({
      tag: "test-router-app",
      views: router([
        define({
          tag: "test-router-nested-root-view",
          nested: router([NestedView]),
          nestedTwo: router([NestedView]),
        }),
      ]),
    });
    const el = document.createElement("test-router-app");
    el.connectedCallback();

    return Promise.resolve().then(() => {
      expect(el.views).toEqual([]);
    });
  });

  it("throws for nested router defined inside of the dialog view", () => {
    const NestedView = define({ tag: "test-router-nested-root-nested-view" });
    const DialogView = define({
      [router.connect]: {
        dialog: true,
      },
      tag: "test-router-nested-dialog-view",
      nested: router([NestedView]),
    });
    define({
      tag: "test-router-app",
      views: router([
        define({
          [router.connect]: { stack: [DialogView] },
          tag: "test-router-nested-root-view",
          nested: router([NestedView]),
        }),
      ]),
    });
    const el = document.createElement("test-router-app");
    el.connectedCallback();

    return Promise.resolve().then(() => {
      expect(el.views).toEqual([]);
    });
  });

  it("throws when parent view has 'url' option", () => {
    const NestedView = define({ tag: "test-router-nested-root-nested-view" });
    define({
      tag: "test-router-app",
      views: router([
        define({
          [router.connect]: {
            url: "/",
          },
          tag: "test-router-nested-root-view",
          nested: router([NestedView]),
        }),
      ]),
    });
    const el = document.createElement("test-router-app");
    el.connectedCallback();

    return Promise.resolve().then(() => {
      expect(el.views).toEqual([]);
    });
  });

  it("throws when global parameter is not defined", () => {
    define({
      tag: "test-router-app",
      views: router(
        [
          define({
            tag: "test-router-nested-root-view",
          }),
        ],
        { params: ["global"] },
      ),
    });
    const el = document.createElement("test-router-app");
    el.connectedCallback();

    return Promise.resolve().then(() => {
      expect(el.views).toEqual([]);
    });
  });

  it("uses push navigation to view with multiple parents", () => {
    const Target = define({
      tag: "test-router-view-multiple-parents-target",
    });

    const A = define({
      tag: "test-router-view-multiple-parents-a",
      [router.connect]: {
        stack: [Target],
      },
      content: () => html` <a href="${router.url(B)}"></a> `,
    });

    const B = define({
      tag: "test-router-view-multiple-parents-b",
      [router.connect]: {
        stack: [Target],
      },
      content: () => html` <a href="${router.url(Target)}"></a> `,
    });

    define({
      tag: "test-router-view-multiple-parents",
      stack: router([A, B]),
      content: ({ stack }) => html`${stack}`,
    });

    const el = document.createElement("test-router-view-multiple-parents");
    document.body.appendChild(el);

    return resolveTimeout(() => {
      el.querySelector("a").click();
      return resolveTimeout(() => {
        el.querySelector("a").click();

        return resolveTimeout(() => {
          expect(history.state.length).toBe(2);
          document.body.removeChild(el);
        });
      });
    });
  });

  describe("test app", () => {
    beforeAll(() => {
      NestedViewTwo = define({
        [router.connect]: {
          url: "/nested/:value/test?param",
        },
        tag: "test-router-nested-view-two",
        value: "1",
        param: false,
      });

      define({
        tag: "test-router-nested-component",
        scroll: {
          value: undefined,
          connect(_) {
            const el = _.render().children[0];
            el.scrollTop = 100;
            el.scrollLeft = 100;
          },
        },
        render: () => html`
          <div class="overflow" style="height: 100px; overflow: scroll">
            <div style="height: 300px"></div>
          </div>
        `,
      });

      NestedViewOne = define({
        [router.connect]: {
          stack: [NestedViewTwo],
        },
        tag: "test-router-nested-view-one",
        globalA: "",
        globalC: "",
        render: () => html`
          <test-router-nested-component></test-router-nested-component>
          <slot></slot>
        `,
        content: () => html`
          <a
            href="${router.url(NestedViewTwo, { value: "1" })}"
            id="NestedViewTwo"
            >NestedViewTwo</a
          >
        `,
      });

      OtherChildView = define({
        [router.connect]: { url: "/other_url_child" },
        param: false,
        tag: "test-router-other-child-view",
        content: () => html`
          <a href="${router.url(MultipleView)}" id="MultipleViewFromOtherChild"
            >MultipleViewFromOtherChild</a
          >
        `,
      });

      OtherChildWithSharedUrl = define({
        [router.connect]: {
          url: "/a/:value",
        },
        value: "",
        tag: "test-router-other-child-with-shared-url",
      });

      OtherChildWithLongerUrl = define({
        [router.connect]: { url: "/a/:value/other" },
        value: "",
        tag: "test-router-other-child-view-longer",
      });

      ChildView = define({
        [router.connect]: {
          stack: [
            OtherChildWithSharedUrl,
            OtherChildWithLongerUrl,
            OtherChildView,
          ],
        },
        tag: "test-router-child-view",
        globalA: "",
        globalC: "value",
        views: router([NestedViewOne], { params: ["globalC"] }),
        render: () => html`<slot></slot>`, // prettier-ignore
        content: ({ views }) => html`
          ${views}
          <a href="${router.url(RootView)}" id="RootView">RootView</a>
          <a
            href="${router.url(RootView, { scrollToTop: true })}"
            id="RootViewScrollToTop"
          >
            RootView with scroll to top
          </a>
          <a href="${router.url(OtherChildView)}" id="OtherChildView"
            >OtherChildView</a
          >
          <a href="${router.url(MultipleView)}" id="MultipleViewFromChild"
            >MultipleViewFromChild</a
          >
        `,
      });

      Dialog2 = define({
        [router.connect]: { dialog: true },
        tag: "test-router-dialog2",
        param: 1,
        content: () =>
          html`<a href="${router.backUrl()}" id="Dialog2Back"></a>`,
      });

      Dialog = define({
        [router.connect]: { dialog: true },
        tag: "test-router-dialog",
        param: 1,
        content: () => html`
          <a href="${router.currentUrl({ param: 2 })}" id="DialogCurrent"
            >DialogCurrent</a
          >
          <a href="${router.url(Dialog2)}" id="Dialog2"></a>
        `,
      });

      MultipleView = define({
        [router.connect]: {
          multiple: true,
        },
        value: "",
        param: 0,
        tag: "test-router-multiple-view",
        content: () => html`
          <a href="${router.currentUrl()}" id="MultipleViewCurrent"
            >MultipleViewCurrent</a
          >
          <a
            href="${router.currentUrl({ param: 2 })}"
            id="MultipleViewCurrentOther"
            >MultipleViewCurrentOther</a
          >
        `,
      });

      MultipleViewWithUrl = define({
        [router.connect]: {
          multiple: true,
          url: "/multiple/:value/test?param",
        },
        value: "",
        param: 0,
        tag: "test-router-multiple-with-url-view",
        content: () => html`
          <a href="${router.currentUrl()}" id="MultipleViewCurrent"
            >MultipleViewCurrent</a
          >
          <a
            href="${router.currentUrl({ param: 2 })}"
            id="MultipleViewCurrentOther"
            >MultipleViewCurrentOther</a
          >
          <a
            href="${router.currentUrl({ value: "other" })}"
            id="MultipleViewCurrentOtherPath"
            >MultipleViewCurrentOtherPath</a
          >
        `,
      });

      function delayWithPromise(_, event) {
        router.resolve(event, Promise.resolve());
      }

      RootView = define({
        [router.connect]: {
          stack: [
            ChildView,
            MultipleView,
            MultipleViewWithUrl,
            Dialog,
            Dialog2,
          ],
        },
        tag: "test-router-root-view",
        globalB: "",
        content: () => html`
          <a href="${router.url(ChildView)}" id="ChildView">Child</a>
          <a href="${router.url(Dialog)}" id="Dialog">Dialog</a>
          <a href="${router.currentUrl({ scrollToTop: true })}" id="RootView">
            RootView
          </a>
          <a
            href="${router.url(ChildView)}"
            onclick="${delayWithPromise}"
            id="ChildViewDelayed"
          >
            Child
          </a>
          <a
            href="${router.url(OtherChildView)}"
            onclick="${delayWithPromise}"
            id="OtherChildViewDelayed"
          >
            OtherChild
          </a>

          <a
            href="${router.url(MultipleView, { value: "test", param: 1 })}"
            id="MultipleView"
          >
            MultipleView
          </a>
          <a
            href="${router.url(MultipleViewWithUrl, {
              value: "test",
              param: 1,
            })}"
            id="MultipleViewWithUrl"
          >
            MultipleViewWithUrl
          </a>

          <form id="form-with-outer-action">
            <button type="submit"></button>
          </form>

          <form id="form-with-action" action="${router.url(ChildView)}">
            <button type="submit"></button>
          </form>

          <form
            id="form-with-resolve"
            onsubmit="${delayWithPromise}"
            action="${router.url(OtherChildView)}"
          >
            <button type="submit"></button>
          </form>

          <div id="overflow" style="height: 100px; overflow: scroll">
            <div style="height: 300px"></div>
          </div>
          <input id="input" />
        `,
      });

      define({
        tag: "test-router-app",
        globalA: "value",
        globalB: "value",
        views: router([RootView], {
          params: ["globalA", "globalB"],
          transition: true,
        }),
        content: ({ views }) => html`${views}`, // prettier-ignore
      });

      return resolveTimeout(() => {});
    });

    describe("bootstrap root router", () => {
      beforeEach(() => {
        host = document.createElement("test-router-app");
      });

      afterEach(() => {
        if (host.parentElement) {
          host.parentElement.removeChild(host);
        }
      });

      it("returns empty array for not connected host", () => {
        expect(host.views).toEqual([]);
      });

      it("clears or restores state from the history", () => {
        window.history.replaceState(null, "", "/other_child/1");
        document.body.appendChild(host);

        let state;
        let url;

        return resolveTimeout(() => {
          // Clears URL and uses root view
          expect(window.location.pathname).toBe(browserUrl);
          expect(hybrids(host.views[0])).toBe(RootView);
          expect(hybrids(host.children[0])).toBe(RootView);

          host.querySelector("#Dialog").click();

          return resolveTimeout(() => {
            state = window.history.state;
            host.parentElement.removeChild(host);

            window.history.replaceState([state[0]], "", "/");

            host = document.createElement("test-router-app");
            document.body.appendChild(host);

            return resolveTimeout(() => {
              // Uses saved state from the window history
              expect(hybrids(host.children[0])).toBe(RootView);
              host.querySelector("#ChildView").click();

              return resolveTimeout(() => {
                state = window.history.state;
                url = window.location.pathname;
                host.parentElement.removeChild(host);

                return resolveTimeout(() => {
                  window.history.replaceState([state[0]], "", url);

                  host = document.createElement("test-router-app");
                  document.body.appendChild(host);

                  return resolveTimeout(() => {
                    // Clears state and uses root view
                    expect(hybrids(host.children[0])).toBe(ChildView);
                    state = window.history.state;
                    url = window.location.pathname;
                    host.parentElement.removeChild(host);

                    return resolveTimeout(() => {
                      window.history.replaceState([state[0]], "", url);

                      const Another = define({ tag: "test-router-another" });
                      define({
                        tag: "test-router-app-another",
                        views: router([Another]),
                        content: ({ views }) => html`${views}`, // prettier-ignore
                      });

                      host = document.createElement("test-router-app-another");
                      document.body.appendChild(host);

                      return resolveTimeout(() => {
                        // Clears not connected views and uses root view
                        expect(
                          constructors.get(host.children[0].constructor),
                        ).toBe(Another);
                        window.history.replaceState(null, "", browserUrl);
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    describe("connected", () => {
      beforeAll(() => {
        host = document.createElement("test-router-app");

        host.style.height = "200vh";
        host.style.width = "200vw";
        host.style.display = "block";

        window.history.replaceState(null, "", browserUrl);

        document.body.appendChild(host);

        return resolveTimeout(() => {});
      });

      afterAll(() => {
        if (host.parentElement) {
          host.parentElement.removeChild(host);
        }
      });

      it("throws when connecting root router twice", () => {
        const el = document.createElement("test-router-app");
        el.connectedCallback();

        return Promise.resolve().then(() => {
          expect(el.views).toEqual([]);
        });
      });

      it("displays root view", () =>
        resolveTimeout(() => {
          expect(hybrids(host.views[0])).toBe(RootView);
          expect(hybrids(host.children[0])).toBe(RootView);

          expect(
            document.documentElement.getAttribute("router-transition"),
          ).toBe("");
        }));

      it("navigates when browser pops a new url within the router", () =>
        resolveTimeout(() => {
          expect(hybrids(host.views[0])).toBe(RootView);

          window.history.pushState(
            null,
            "",
            window.location.pathname + "#@test-router-child-view",
          );
          window.history.pushState(
            null,
            "",
            window.location.pathname + "#@test-router-child-view",
          );

          return resolveTimeout(() => {
            history.back();

            return resolveTimeout(() => {
              expect(hybrids(host.views[0])).toBe(ChildView);
              history.back();
              return resolveTimeout(() => {
                expect(hybrids(host.views[0])).toBe(RootView);
              });
            });
          });
        }));

      it("navigates when browser pops a new url outside the router", () =>
        resolveTimeout(() => {
          expect(hybrids(host.views[0])).toBe(RootView);

          window.history.pushState(
            null,
            "",
            window.location.pathname + "#nope",
          );

          window.history.pushState(
            null,
            "",
            window.location.pathname + "#nope",
          );

          history.back();

          return resolveTimeout(() => {
            expect(hybrids(host.views[0])).toBe(RootView);
            history.back();
            return resolveTimeout(() => {});
          });
        }));

      it("saves and restores scroll position preserving focused element", () => {
        const input = host.querySelector("#input");
        const root = document.scrollingElement;
        input.focus();

        return resolveTimeout(() => {
          root.scrollTop = 20;
          root.scrollLeft = 20;

          const spyTop = spyOnProperty(
            root,
            "scrollTop",
            "set",
          ).and.callThrough();
          const spyLeft = spyOnProperty(
            root,
            "scrollLeft",
            "set",
          ).and.callThrough();

          host.querySelector("#ChildView").click();

          return resolveTimeout(() => {
            expect(hybrids(host.views[0])).toBe(ChildView);
            expect(spyTop.calls.mostRecent().args[0]).toBe(0);
            expect(spyLeft.calls.mostRecent().args[0]).toBe(0);

            host.querySelector("#RootView").click();

            return resolveTimeout(() => {
              expect(hybrids(host.views[0])).toBe(RootView);
              expect(document.activeElement).toBe(input);

              expect(spyTop.calls.mostRecent().args[0]).toBe(20);
              expect(spyLeft.calls.mostRecent().args[0]).toBe(20);

              host.querySelector("#ChildView").click();

              return resolveTimeout(() => {
                expect(spyTop.calls.mostRecent().args[0]).toBe(0);
                expect(spyLeft.calls.mostRecent().args[0]).toBe(0);

                host.querySelector("#RootViewScrollToTop").click();

                return resolveTimeout(() => {
                  expect(hybrids(host.views[0])).toBe(RootView);

                  root.scrollTop = 20;

                  host.querySelector("#RootView").click();

                  return resolveTimeout(() => {
                    expect(hybrids(host.views[0])).toBe(RootView);

                    expect(spyTop.calls.mostRecent().args[0]).toBe(0);
                    expect(spyLeft.calls.mostRecent().args[0]).toBe(0);
                  });
                });
              });
            });
          });
        });
      });

      it("navigate by pushing and pulling views from the stack", () => {
        expect(host.views[0].globalA).toBe(undefined);
        expect(host.views[0].globalB).toBe("value");

        expect(document.documentElement.getAttribute("router-transition")).toBe(
          "",
        );

        host.querySelector("#ChildView").click();

        return resolveTimeout(() => {
          expect(hybrids(host.children[0])).toBe(ChildView);
          expect(window.history.state.length).toBe(2);
          expect(router.backUrl().hash).toBe("#@test-router-root-view");
          expect(host.children[0].globalA).toBe("value");

          expect(
            document.documentElement.getAttribute("router-transition"),
          ).toBe("forward");

          host.querySelector("#OtherChildView").click();

          return resolveTimeout(() => {
            expect(hybrids(host.children[0])).toBe(OtherChildView);
            expect(window.history.state.length).toBe(3);
            expect(host.views.length).toBe(1);
            expect(router.backUrl().hash).toBe("#@test-router-child-view");
            expect(router.backUrl({ scrollToTop: true }).hash).toBe(
              "#@test-router-child-view?scrollToTop=1",
            );

            expect(
              document.documentElement.getAttribute("router-transition"),
            ).toBe("forward");

            window.history.back();

            return resolveTimeout(() => {
              expect(hybrids(host.children[0])).toBe(ChildView);
              expect(hybrids(host.children[0].views[0])).toBe(NestedViewOne);
              expect(window.history.state.length).toBe(2);
              expect(host.views[0].views[0].globalC).toBe("value");
              expect(host.views[0].views[0].globalA).toBe("");

              expect(
                document.documentElement.getAttribute("router-transition"),
              ).toBe("backward");

              host.querySelector("#NestedViewTwo").click();

              return resolveTimeout(() => {
                expect(hybrids(host.children[0])).toBe(ChildView);
                expect(hybrids(host.children[0].views[0])).toBe(NestedViewTwo);
                expect(window.history.state.length).toBe(3);

                expect(router.backUrl().hash).toBe("#@test-router-root-view");
                expect(router.backUrl({ nested: true }).hash).toBe(
                  "#@test-router-nested-view-one",
                );

                host.children[0].views[0].param = true;

                return resolveTimeout(() => {
                  expect(host.children[0].views[0].param).toBe(true);
                  expect(window.location.search).toBe("?param=1");

                  expect(
                    document.documentElement.getAttribute("router-transition"),
                  ).toBe("");

                  host.children[0].views[0].param = false;

                  return resolveTimeout(() => {
                    expect(host.children[0].views[0].param).toBe(false);
                    expect(window.location.search).toBe("");

                    host.querySelector("#RootView").click();

                    return resolveTimeout(() => {
                      expect(hybrids(host.children[0])).toBe(RootView);
                      expect(window.history.state.length).toBe(1);

                      host.querySelector("#Dialog").click();

                      return resolveTimeout(() => {
                        expect(hybrids(host.children[0])).toBe(RootView);
                        expect(hybrids(host.children[1])).toBe(Dialog);
                        expect(window.history.state.length).toBe(2);

                        expect(
                          document.documentElement.getAttribute(
                            "router-transition",
                          ),
                        ).toBe("dialog");

                        host.querySelector("#Dialog2").click();

                        return resolveTimeout(() => {
                          expect(hybrids(host.children[0])).toBe(RootView);
                          expect(hybrids(host.children[1])).toBe(Dialog);
                          expect(hybrids(host.children[2])).toBe(Dialog2);
                          expect(window.history.state.length).toBe(3);

                          host.querySelector("#Dialog2Back").click();

                          return resolveTimeout(() => {
                            expect(hybrids(host.children[0])).toBe(RootView);
                            expect(hybrids(host.children[1])).toBe(Dialog);
                            expect(window.history.state.length).toBe(2);

                            expect(
                              document.documentElement.getAttribute(
                                "router-transition",
                              ),
                            ).toBe("dialog");

                            const keyEventEsc = new KeyboardEvent("keydown", {
                              key: "Escape",
                            });
                            const keyEventEnter = new KeyboardEvent("keydown", {
                              key: "Enter",
                            });
                            host.children[1].dispatchEvent(keyEventEnter);
                            host.children[1].dispatchEvent(keyEventEsc);

                            return resolveTimeout(() => {
                              expect(hybrids(host.children[0])).toBe(RootView);
                              expect(window.history.state.length).toBe(1);
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });

      it("navigates to other child and replaces whole stack it with another view", () => {
        host.querySelector("#ChildView").click();

        return resolveTimeout(() => {
          expect(hybrids(host.children[0])).toBe(ChildView);
          host.querySelector("#OtherChildView").click();

          return resolveTimeout(() => {
            expect(hybrids(host.children[0])).toBe(OtherChildView);
            host.querySelector("#MultipleViewFromOtherChild").click();

            return resolveTimeout(() => {
              expect(hybrids(host.children[0])).toBe(MultipleView);
              window.history.back();

              return resolveTimeout(() => {
                expect(hybrids(host.children[0])).toBe(RootView);
              });
            });
          });
        });
      });

      it("navigates to other child and replaces current stack it with another view", () => {
        host.querySelector("#ChildView").click();

        return resolveTimeout(() => {
          expect(hybrids(host.children[0])).toBe(ChildView);
          host.querySelector("#MultipleViewFromChild").click();

          return resolveTimeout(() => {
            expect(hybrids(host.children[0])).toBe(MultipleView);

            expect(
              document.documentElement.getAttribute("router-transition"),
            ).toBe("replace");

            window.history.back();

            return resolveTimeout(() => {
              expect(hybrids(host.children[0])).toBe(RootView);
            });
          });
        });
      });

      it("navigates to multiple view without url", () => {
        host.querySelector("#MultipleView").click();

        return resolveTimeout(() => {
          expect(hybrids(host.children[0])).toBe(MultipleView);
          expect(host.views[0].value).toBe("test");
          expect(host.views[0].param).toBe(1);

          const view = host.views[0];

          host.querySelector("#MultipleViewCurrent").click();

          return resolveTimeout(() => {
            expect(host.views[0]).toBe(view);

            host.querySelector("#MultipleViewCurrentOther").click();

            return resolveTimeout(() => {
              expect(host.views[0]).not.toBe(view);
              window.history.back();

              return resolveTimeout(() => {
                expect(host.views[0]).toBe(view);
                window.history.back();

                return resolveTimeout(() => {
                  expect(hybrids(host.children[0])).toBe(RootView);
                });
              });
            });
          });
        });
      });

      it("navigates to multiple view with url", () => {
        host.querySelector("#MultipleViewWithUrl").click();

        return resolveTimeout(() => {
          expect(hybrids(host.children[0])).toBe(MultipleViewWithUrl);
          expect(host.views[0].value).toBe("test");
          expect(host.views[0].param).toBe(1);

          const view = host.views[0];

          host.querySelector("#MultipleViewCurrent").click();

          return resolveTimeout(() => {
            expect(host.views[0]).toBe(view);

            host.querySelector("#MultipleViewCurrentOther").click();

            return resolveTimeout(() => {
              expect(host.views[0]).toBe(view);
              expect(host.views[0].param).toBe(2);

              host.querySelector("#MultipleViewCurrentOtherPath").click();

              return resolveTimeout(() => {
                expect(host.views[0]).not.toBe(view);
                expect(host.views[0].value).toBe("other");

                window.history.back();

                return resolveTimeout(() => {
                  expect(host.views[0]).toBe(view);
                  window.history.back();

                  return resolveTimeout(() => {
                    expect(hybrids(host.children[0])).toBe(RootView);
                  });
                });
              });
            });
          });
        });
      });

      it("skips navigation when ctrl or shift key is pressed", () => {
        const preventClick = (e) => e.preventDefault();
        const anchor = host.querySelector("#ChildView");

        document.addEventListener("click", preventClick);

        const ctrlEvt = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
          ctrlKey: true,
        });

        anchor.dispatchEvent(ctrlEvt);

        const metaEvt = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
          metaKey: true,
        });

        anchor.dispatchEvent(metaEvt);

        document.removeEventListener("click", preventClick);

        return resolveTimeout(() => {
          expect(hybrids(host.views[0])).toBe(RootView);
        });
      });

      it("skips navigation by form with outer action", () => {
        const preventFormSubmit = (e) => e.preventDefault();

        document.addEventListener("submit", preventFormSubmit);

        const form = host.querySelector("#form-with-outer-action");
        const button = host.querySelector("#form-with-outer-action button");

        form.action = "0139eu0923r0923ur";
        button.click();

        form.action = "https://google.com";
        button.click();

        document.removeEventListener("submit", preventFormSubmit);

        return resolveTimeout(() => {
          expect(hybrids(host.views[0])).toBe(RootView);
        });
      });

      it("navigates by form submission", () => {
        const button = host.querySelector("#form-with-action button");
        button.click();

        return resolveTimeout(() => {
          expect(hybrids(host.children[0])).toBe(ChildView);
          window.history.back();

          return resolveTimeout(() => {});
        });
      });

      it("navigates by form submission with resolve promise", () => {
        const button = host.querySelector("#form-with-resolve button");
        button.click();

        return resolveTimeout(() => {
          expect(hybrids(host.children[0])).toBe(OtherChildView);
          window.history.back();

          return resolveTimeout(() => {});
        });
      });

      it("navigates by link with resolve promise", () => {
        const button = host.querySelector("#ChildViewDelayed");
        button.click();

        return resolveTimeout(() => {
          expect(hybrids(host.children[0])).toBe(ChildView);
          window.history.back();

          return resolveTimeout(() => {});
        });
      });

      it("cancels and navigates by link with resolve promise", () => {
        host.querySelector("#ChildViewDelayed").click();
        host.querySelector("#OtherChildViewDelayed").click();

        return resolveTimeout(() => {
          expect(hybrids(host.children[0])).toBe(OtherChildView);
          window.history.back();

          return resolveTimeout(() => {});
        });
      });
    });

    describe("url() -", () => {
      it("returns empty string for not connected view", () => {
        const MyElement = { tag: "test-router-my-element" };
        expect(router.url(MyElement)).toBe("");
      });

      it("throws for duplicated parameters in URL", () => {
        const desc = router([
          define({
            [router.connect]: { url: "/:test?test" },
            tag: "test-router-url-error",
          }),
        ]);

        expect(() =>
          desc.connect(document.createElement("div"), "test", () => {}),
        ).toThrow();
      });

      it("throws for duplicated parameters in URL", () => {
        const desc = router([
          define({
            [router.connect]: { url: "/:test" },
            test: () => "",
            tag: "test-router-url-error",
          }),
        ]);

        expect(() =>
          desc.connect(document.createElement("div"), "test", () => {}),
        ).toThrow();
      });

      describe("with connected router", () => {
        beforeAll(() => {
          host = document.createElement("test-router-app");
          document.body.appendChild(host);
        });

        afterAll(() => {
          document.body.removeChild(host);
        });

        describe("without 'url' option", () => {
          it("returns URL with hash for view with not set 'url' option", () => {
            const url = router.url(RootView, { param: false });
            expect(url).toBeInstanceOf(URL);
            expect(url.hash).toBe("#@test-router-root-view?param=");
          });
        });

        describe("with 'url' option", () => {
          it("throws an error for missing parameter", () => {
            expect(() =>
              router.url(NestedViewTwo, { otherParam: 1 }),
            ).toThrow();
          });

          it("does not throws an error when set meta parameter", () => {
            expect(() =>
              router.url(NestedViewTwo, { value: "", scrollToTop: true }),
            ).not.toThrow();
          });

          it("returns URL with pathname", () => {
            const url = router.url(OtherChildView);
            expect(url).toBeInstanceOf(URL);
            expect(url.hash).toBe("");
            expect(url.pathname).toBe("/other_url_child");
            expect(url.search).toBe("");
          });

          it("returns URL with parameter and search", () => {
            const url = router.url(NestedViewTwo, {
              value: 1,
              param: false,
            });
            expect(url).toBeInstanceOf(URL);
            expect(url.hash).toBe("");
            expect(url.pathname).toBe("/nested/1/test");
            expect(url.search).toBe("?param=");
          });
        });
      });
    });

    describe("currentUrl() -", () => {
      it("returns an empty string when no router is connected", () => {
        window.history.replaceState(null, "", browserUrl);
        expect(router.currentUrl()).toBe("");
      });

      it("returns an url to the current OtherChildWithLongerUrl view", () => {
        window.history.replaceState(null, "", "/a/other_url_child/other");

        host = document.createElement("test-router-app");
        document.body.appendChild(host);

        return resolveTimeout(() => {
          expect(hybrids(host.views[0])).toBe(OtherChildWithLongerUrl);
          expect(router.currentUrl().pathname).toBe("/a/other_url_child/other");
          expect(router.currentUrl({ param: true }).search).toBe("?param=1");

          document.body.removeChild(host);
        });
      });

      it("returns an url to the current OtherChild view", () => {
        window.history.replaceState(null, "", "/other_url_child?param=1");

        host = document.createElement("test-router-app");
        document.body.appendChild(host);

        return resolveTimeout(() => {
          expect(hybrids(host.views[0])).toBe(OtherChildView);
          expect(host.views[0].param).toBe(true);
          expect(router.currentUrl().pathname).toBe("/other_url_child");
          expect(router.currentUrl({ param: true }).search).toBe("?param=1");

          document.body.removeChild(host);
        });
      });

      it("returns an url to the current nested view", () => {
        window.history.replaceState(null, "", "/nested/1/test");

        host = document.createElement("test-router-app");
        document.body.appendChild(host);

        return resolveTimeout(() => {
          expect(router.currentUrl().pathname).toBe("/nested/1/test");
          expect(router.currentUrl({ param: true }).search).toBe("?param=1");

          document.body.removeChild(host);
        });
      });
    });

    describe("active() -", () => {
      afterEach(() => {
        if (host && host.parentElement) {
          host.parentElement.removeChild(host);
        }
      });

      it("returns false when no router is connected", () => {
        window.history.replaceState(null, "");
        expect(router.active(RootView)).toBe(false);
      });

      it("returns boolean value for views", () => {
        window.history.replaceState(null, "", browserUrl);
        host = document.createElement("test-router-app");
        document.body.appendChild(host);

        return resolveTimeout(() => {
          expect(() => router.active({})).toThrow();

          expect(router.active(RootView)).toBe(true);
          expect(router.active(ChildView)).toBe(false);
          expect(router.active([RootView])).toBe(true);
          expect(router.active([RootView, ChildView])).toBe(true);

          host.querySelector("#ChildView").click();

          return resolveTimeout(() => {
            expect(router.active(RootView)).toBe(false);
            expect(router.active(RootView, { stack: true })).toBe(true);
            expect(router.active(ChildView)).toBe(true);
            expect(router.active([RootView])).toBe(false);
            expect(router.active([RootView, ChildView])).toBe(true);
          });
        });
      });
    });
  });

  describe("backUrl() -", () => {
    it("returns an empty string when no router is connected", () => {
      window.history.replaceState(null, "", browserUrl);
      expect(router.backUrl()).toBe("");
    });

    describe("for stacked view as an entry point", () => {
      let NestedOne;
      let NestedTwo;
      let Child;
      let OtherChild;
      let Home;

      beforeAll(() => {
        NestedOne = define({
          [router.connect]: {
            url: "/child",
          },
          tag: "test-router-child-nested-back-url",
        });

        Child = define({
          tag: "test-router-child-back-url",
          nestedViews: router([NestedOne]),
          content: () => html` <a href="${router.url(Home)}">Home</a> `,
        });

        NestedTwo = define({
          [router.connect]: {
            url: "/nested_two",
          },
          tag: "test-router-child-nested-two-back-url",
        });

        OtherChild = define({
          [router.connect]: {
            stack: [NestedTwo],
            guard: () => true,
          },
          tag: "test-router-other-child-back-url",
        });

        Home = define({
          [router.connect]: { stack: [Child, OtherChild] },
          tag: "test-router-home-back-url",
          content: () => html` <a href="${router.guardUrl()}">Child</a> `,
        });

        define({
          tag: "test-router-app-back-url",
          views: router([Home]),
          content: ({ views }) => html`${views}`, // prettier-ignore
        });
      });

      afterAll(() => {
        window.history.replaceState(null, "", browserUrl);
        return resolveTimeout(() => {});
      });

      beforeEach(() => {
        host = document.createElement("test-router-app-back-url");
      });

      afterEach(() => {
        if (host.parentElement) {
          document.body.removeChild(host);
        }
      });

      it("returns a parent url", () => {
        window.history.replaceState(null, "", "/child");
        document.body.appendChild(host);

        return resolveTimeout(() => {
          expect(router.backUrl().hash).toBe("#@test-router-home-back-url");
          expect(router.backUrl({ nested: true }).hash).toBe(
            "#@test-router-child-back-url",
          );
        });
      });

      it("returns an empty string when root is active", () => {
        window.history.replaceState(null, "", browserUrl);
        document.body.appendChild(host);

        return resolveTimeout(() => {
          expect(router.backUrl()).toBe("");
        });
      });

      it("returns closest not guarded view", () => {
        window.history.replaceState(null, "", "/nested_two");
        document.body.appendChild(host);

        return resolveTimeout(() => {
          expect(router.backUrl().hash).toBe("#@test-router-home-back-url");
          expect(router.backUrl({ nested: true }).hash).toBe(
            "#@test-router-home-back-url",
          );
        });
      });

      it("returns empty string when no unguarded view is in the tree", () => {
        const ChildUnguarded = define({ tag: "test-router-child-unguarded" });

        define({
          tag: "test-router-app-unguarded",
          views: router([
            define({
              [router.connect]: {
                stack: [ChildUnguarded],
                guard: () => true,
              },
              tag: "test-router-home-view-unguarded",
            }),
          ]),
          content: ({ views }) => html`${views}`, // prettier-ignore
        });

        const guardedHost = document.createElement("test-router-app-unguarded");

        window.history.replaceState(null, "", browserUrl);
        document.body.appendChild(guardedHost);

        return resolveTimeout(() => {
          expect(router.backUrl()).toBe("");
          expect(hybrids(guardedHost.views[0])).toBe(ChildUnguarded);
          document.body.removeChild(guardedHost);
        });
      });
    });
  });

  describe("guardUrl() -", () => {
    it("returns an empty string when no router is connected", () => {
      window.history.replaceState(null, "", browserUrl);
      expect(router.guardUrl()).toBe("");
    });

    describe("", () => {
      let guardFlag;

      beforeAll(() => {
        ChildView = define({
          [router.connect]: {
            url: "/child",
          },
          tag: "test-router-child-view",
        });

        OtherChildView = define({
          tag: "test-router-other-child-view",
          [router.connect]: {
            url: "/other_child",
          },
          content: () => html`
            <a href="${router.url(RootView)}" id="RootView">RootView</a>
          `,
        });

        RootView = define({
          [router.connect]: {
            stack: [ChildView, OtherChildView],
            guard: () => {
              if (!guardFlag) throw Error("guard failed");
              return guardFlag;
            },
          },
          tag: "test-router-root-view",
          content: () => html`
            <a href="${router.url(OtherChildView)}" id="OtherChildView"
              >OtherChildView</a
            >
          `,
        });

        define({
          tag: "test-router-app-guard-url",
          views: router([RootView]),
          content: ({ views }) => html`${views}`, // prettier-ignore
        });

        host = document.createElement("test-router-app-guard-url");
        document.body.appendChild(host);

        return resolveTimeout(() => {});
      });

      afterAll(() => {
        window.history.replaceState(null, "", browserUrl);
        document.body.removeChild(host);
      });

      it("shows parent guarded view and navigate to other child", () => {
        expect(hybrids(host.views[0])).toBe(RootView);
        expect(router.guardUrl().pathname).toBe("/child");

        guardFlag = false;
        let el = host.querySelector("#OtherChildView");
        el.click();

        return resolveTimeout(() => {
          expect(hybrids(host.views[0])).toBe(RootView);
          expect(router.guardUrl().pathname).toBe("/other_child");

          guardFlag = true;

          el.click();

          return resolveTimeout(() => {
            expect(router.guardUrl()).toBe("");
            expect(hybrids(host.views[0])).toBe(OtherChildView);
            el = host.querySelector("#RootView");

            expect(el.hash).toBe("#@test-router-root-view");
            el.click();

            return resolveTimeout(() => {
              expect(hybrids(host.views[0])).toBe(ChildView);
            });
          });
        });
      });
    });
  });

  describe("debug()", () => {
    let app;
    afterEach(() => {
      if (app) document.body.removeChild(app);
      router.debug(false);
    });

    it("when called turns on logging", () => {
      router.debug();

      const OtherNestedDebug = define({
        tag: "test-router-other-nested-debug-view",
        param: "",
      });

      const NestedDebug = define({
        tag: "test-router-nested-debug-view",
        content: () => html`
          <a
            href="${router.url(OtherNestedDebug, { param: "test" })}"
            id="other-nested-debug"
            >OtherNestedDebug</a
          >
        `,
      });

      const HomeDebug = define({
        tag: "test-router-home-debug-view",
        stack: router([NestedDebug, OtherNestedDebug]),
        content: ({ stack }) => html`${stack}`, // prettier-ignore
      });

      define({
        tag: "test-router-debug",
        stack: router(HomeDebug),
        content: ({ stack }) => html`${stack}`, // prettier-ignore
      });

      app = document.createElement("test-router-debug");
      expect(app.stack).toEqual([]);

      document.body.appendChild(app);

      const spy = spyOn(console, "groupCollapsed");

      return resolveTimeout(() => {
        expect(spy).toHaveBeenCalled();
        app.querySelector("#other-nested-debug").click();

        return resolveTimeout(() => {
          expect(spy).toHaveBeenCalled();
        });
      });
    });
  });
});

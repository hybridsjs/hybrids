import { define, html, router } from "../../src/index.js";
import { resolveTimeout } from "../helpers.js";

function hybrids(el) {
  return el.constructor.hybrids;
}

const browserUrl = window.location.pathname;

describe("router:", () => {
  let RootView;
  let ChildView;
  let OtherChildView;
  let OtherChildWithLongerUrl;
  let NestedViewOne;
  let NestedViewTwo;
  let Dialog;
  let MultipleView;
  let MultipleViewWithUrl;
  let host;

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

    const B = {
      [router.connect]: { stack: () => [A] },
      tag: "test-router-circular-b",
    };

    A = {
      [router.connect]: { stack: [B] },
      tag: "test-router-circular-a",
    };

    const el = document.createElement("div");
    expect(() => router([A]).connect(el)).toThrow();
  });

  it("throws when dialog has 'url' option", () => {
    expect(() =>
      router([
        {
          [router.connect]: { dialog: true, url: "/home" },
          tag: "test-router-dialog-throw",
        },
      ]).connect(document.createElement("div")),
    ).toThrow();
  });

  it("throws when view 'url' option is not a string", () => {
    expect(() =>
      router([
        {
          [router.connect]: { url: true },
          tag: "test-router-url-throw",
        },
      ]).connect(document.createElement("div")),
    ).toThrow();
  });

  it("throws when dialog has 'stack' option", () => {
    expect(() =>
      router([
        {
          [router.connect]: { dialog: true, stack: [] },
          tag: "test-router-dialog-throw",
        },
      ]).connect(document.createElement("div")),
    ).toThrow();
  });

  it("throws when view does not support browser url option", () => {
    expect(() =>
      router([
        {
          [router.connect]: { url: "/test?open" },
          tag: "test-router-url-throw",
        },
      ]).connect(document.createElement("div")),
    ).toThrow();
  });

  it("throws for more than one nested router in the definition", () => {
    const NestedView = { tag: "test-router-nested-root-nested-view" };
    define({
      tag: "test-router-app",
      views: router([
        {
          tag: "test-router-nested-root-view",
          nested: router([NestedView]),
          nestedTwo: router([NestedView]),
        },
      ]),
    });
    const el = document.createElement("test-router-app");
    expect(() => el.connectedCallback()).toThrow();
  });

  it("throws for nested router defined inside of the dialog view", () => {
    const NestedView = { tag: "test-router-nested-root-nested-view" };
    const DialogView = {
      [router.connect]: {
        dialog: true,
      },
      tag: "test-router-nested-dialog-view",
      nested: router([NestedView]),
    };
    define({
      tag: "test-router-app",
      views: router([
        {
          [router.connect]: { stack: [DialogView] },
          tag: "test-router-nested-root-view",
          nested: router([NestedView]),
        },
      ]),
    });
    const el = document.createElement("test-router-app");
    expect(() => el.connectedCallback()).toThrow();
  });

  it("throws when parent view has 'url' option", () => {
    const NestedView = { tag: "test-router-nested-root-nested-view" };
    define({
      tag: "test-router-app",
      views: router([
        {
          [router.connect]: {
            url: "/",
          },
          tag: "test-router-nested-root-view",
          nested: router([NestedView]),
        },
      ]),
    });
    const el = document.createElement("test-router-app");
    expect(() => el.connectedCallback()).toThrow();
  });

  it("throws when global parameter is not defined", () => {
    define({
      tag: "test-router-app",
      views: router(
        [
          {
            tag: "test-router-nested-root-view",
          },
        ],
        { params: ["global"] },
      ),
    });
    const el = document.createElement("test-router-app");
    expect(() => el.connectedCallback()).toThrow();
  });

  describe("test app", () => {
    beforeAll(() => {
      NestedViewTwo = {
        [router.connect]: {
          url: "/nested/:value/test?param",
        },
        value: "1",
        param: false,
        tag: "test-router-nested-view-two",
      };

      const NestedComponent = {
        tag: "test-router-nested-component",
        scroll: {
          connect(_) {
            const el = _.render().children[0];
            el.scrollTop = 100;
            el.scrollLeft = 100;
          },
        },
        render: () =>
          html`
            <div class="overflow" style="height: 100px; overflow: scroll">
              <div style="height: 300px"></div>
            </div>
          `,
      };

      NestedViewOne = {
        [router.connect]: {
          stack: [NestedViewTwo],
        },
        tag: "test-router-nested-view-one",
        globalA: "",
        globalC: "",
        render: () =>
          html`
            <test-router-nested-component></test-router-nested-component>
            <slot></slot>
          `.define(NestedComponent),
        content: () => html`
          <a
            href="${router.url(NestedViewTwo, { value: "1" })}"
            id="NestedViewTwo"
            >NestedViewTwo</a
          >
        `,
      };

      OtherChildView = {
        [router.connect]: { url: "/other_url_child" },
        param: false,
        tag: "test-router-other-child-view",
        content: () => html`
          <a href="${router.url(MultipleView)}" id="MultipleViewFromOtherChild"
            >MultipleViewFromOtherChild</a
          >
        `,
      };

      OtherChildWithLongerUrl = {
        [router.connect]: { url: "/:value/other" },
        value: "",
        tag: "test-router-other-child-view-longer",
      };

      ChildView = {
        [router.connect]: {
          stack: [OtherChildWithLongerUrl, OtherChildView],
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
        `,
      };

      Dialog = {
        [router.connect]: { dialog: true },
        tag: "test-router-dialog",
        content: () => html`
          <a href="${router.currentUrl()}" id="DialogCurrent">DialogCurrent</a>
        `,
      };

      MultipleView = {
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
      };

      MultipleViewWithUrl = {
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
      };

      function delayWithPromise(_, event) {
        router.resolve(event, Promise.resolve());
      }

      RootView = {
        [router.connect]: {
          stack: [ChildView, MultipleView, MultipleViewWithUrl, Dialog],
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
      };

      define({
        tag: "test-router-app",
        globalA: "value",
        globalB: "value",
        views: router([RootView], { params: ["globalA", "globalB"] }),
        content: ({ views }) => html`${views}` // prettier-ignore
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

        return resolveTimeout(() => {
          // Clears URL and uses root view
          expect(window.location.pathname).toBe(browserUrl);
          expect(hybrids(host.views[0])).toBe(RootView);
          expect(hybrids(host.children[0])).toBe(RootView);

          host.querySelector("#Dialog").click();

          return resolveTimeout(() => {
            host.parentElement.removeChild(host);

            host = document.createElement("test-router-app");
            document.body.appendChild(host);

            return resolveTimeout(() => {
              // Uses saved state from the window history
              expect(hybrids(host.children[0])).toBe(RootView);
              host.querySelector("#ChildView").click();

              return resolveTimeout(() => {
                host.parentElement.removeChild(host);

                host = document.createElement("test-router-app");
                document.body.appendChild(host);

                return resolveTimeout(() => {
                  // Uses saved state from the window history
                  expect(hybrids(host.children[0])).toBe(ChildView);

                  host.parentElement.removeChild(host);
                  const Another = { tag: "test-router-another" };
                  define({
                    tag: "test-router-app-another",
                    views: router([Another]),
                    content: ({ views }) => html`${views}` // prettier-ignore
                  });

                  host = document.createElement("test-router-app-another");
                  document.body.appendChild(host);

                  return resolveTimeout(() => {
                    // Clears not connected views and uses root view
                    expect(host.children[0].constructor.hybrids).toBe(Another);
                    window.history.replaceState(null, "", browserUrl);
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
        expect(() => {
          const anotherHost = document.createElement("test-router-app");
          anotherHost.connectedCallback();
        }).toThrow();
      });

      it("displays root view", () =>
        resolveTimeout(() => {
          expect(hybrids(host.views[0])).toBe(RootView);
          expect(hybrids(host.children[0])).toBe(RootView);
        }));

      it("saves and restores scroll position preserving focused element", () => {
        const input = host.querySelector("#input");
        input.focus();

        return resolveTimeout(() => {
          document.scrollingElement.scrollTop = 200;
          document.scrollingElement.scrollLeft = 200;

          host.querySelector("#ChildView").click();

          return resolveTimeout(() => {
            expect(document.scrollingElement.scrollTop).toBe(0);
            expect(document.scrollingElement.scrollLeft).toBe(0);

            host.querySelector("#RootView").click();

            return resolveTimeout(() => {
              expect(hybrids(host.views[0])).toBe(RootView);
              expect(document.activeElement).toBe(input);

              expect(document.scrollingElement.scrollTop).toBe(200);
              expect(document.scrollingElement.scrollLeft).toBe(200);

              host.querySelector("#ChildView").click();

              return resolveTimeout(() => {
                expect(document.scrollingElement.scrollTop).toBe(0);
                expect(document.scrollingElement.scrollLeft).toBe(0);

                host.querySelector("#RootViewScrollToTop").click();

                return resolveTimeout(() => {
                  expect(hybrids(host.views[0])).toBe(RootView);
                  expect(document.scrollingElement.scrollTop).toBe(0);
                  expect(document.scrollingElement.scrollLeft).toBe(0);

                  document.scrollingElement.scrollTop = 200;

                  host.querySelector("#RootView").click();

                  return resolveTimeout(() => {
                    expect(hybrids(host.views[0])).toBe(RootView);
                    expect(document.scrollingElement.scrollTop).toBe(0);
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
        host.querySelector("#ChildView").click();

        return resolveTimeout(() => {
          expect(hybrids(host.children[0])).toBe(ChildView);
          expect(window.history.state.length).toBe(2);
          expect(router.backUrl().hash).toBe("#@test-router-root-view");
          expect(host.children[0].globalA).toBe("value");

          host.querySelector("#OtherChildView").click();

          return resolveTimeout(() => {
            expect(hybrids(host.children[0])).toBe(OtherChildView);
            expect(window.history.state.length).toBe(3);
            expect(host.views.length).toBe(1);
            expect(router.backUrl().hash).toBe("#@test-router-child-view");
            expect(router.backUrl({ scrollToTop: true }).hash).toBe(
              "#@test-router-child-view?scrollToTop=1",
            );

            window.history.back();

            return resolveTimeout(() => {
              expect(hybrids(host.children[0])).toBe(ChildView);
              expect(hybrids(host.children[0].views[0])).toBe(NestedViewOne);
              expect(window.history.state.length).toBe(2);
              expect(host.views[0].views[0].globalC).toBe("value");
              expect(host.views[0].views[0].globalA).toBe("");

              host.querySelector("#NestedViewTwo").click();

              return resolveTimeout(() => {
                expect(hybrids(host.children[0])).toBe(ChildView);
                expect(hybrids(host.children[0].views[0])).toBe(NestedViewTwo);
                expect(window.history.state.length).toBe(3);

                expect(router.backUrl().hash).toBe("#@test-router-root-view");
                expect(router.backUrl({ nested: true }).hash).toBe(
                  "#@test-router-nested-view-one",
                );

                host.querySelector("#RootView").click();

                return resolveTimeout(() => {
                  expect(hybrids(host.children[0])).toBe(RootView);
                  expect(window.history.state.length).toBe(1);

                  host.querySelector("#Dialog").click();

                  return resolveTimeout(() => {
                    expect(hybrids(host.children[0])).toBe(RootView);
                    expect(hybrids(host.children[1])).toBe(Dialog);
                    expect(window.history.state.length).toBe(2);

                    host.querySelector("#DialogCurrent").click();

                    return resolveTimeout(() => {
                      expect(hybrids(host.children[0])).toBe(RootView);
                      expect(hybrids(host.children[1])).toBe(Dialog);
                      expect(window.history.state.length).toBe(2);

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
        const preventClick = e => e.preventDefault();
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
        const preventFormSubmit = e => e.preventDefault();

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
          {
            [router.connect]: { url: "/:test?test" },
            tag: "test-router-url-error",
          },
        ]);

        expect(() =>
          desc.connect(document.createElement("div"), "test", () => {}),
        ).toThrow();
      });

      it("throws for duplicated parameters in URL", () => {
        const desc = router([
          {
            [router.connect]: { url: "/:test" },
            test: () => "",
            tag: "test-router-url-error",
          },
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

      it("returns an url to the current stack view", () => {
        window.history.replaceState(null, "", "/other_url_child/other");

        host = document.createElement("test-router-app");
        document.body.appendChild(host);

        return resolveTimeout(() => {
          expect(hybrids(host.views[0])).toBe(OtherChildWithLongerUrl);
          expect(router.currentUrl().pathname).toBe("/other_url_child/other");
          expect(router.currentUrl({ param: true }).search).toBe("?param=1");

          document.body.removeChild(host);
        });
      });

      it("returns an url to the current stack view", () => {
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
        NestedOne = {
          [router.connect]: {
            url: "/child",
          },
          tag: "test-router-child-nested-back-url",
        };

        Child = {
          tag: "test-router-child-back-url",
          nestedViews: router([NestedOne]),
          content: () =>
            html`
              <a href="${router.url(Home)}">Home</a>
            `,
        };

        NestedTwo = {
          [router.connect]: {
            url: "/nested_two",
          },
          tag: "test-router-child-nested-two-back-url",
        };

        OtherChild = {
          [router.connect]: {
            stack: [NestedTwo],
            guard: () => true,
          },
          tag: "test-router-other-child-back-url",
        };

        Home = {
          [router.connect]: { stack: [Child, OtherChild] },
          tag: "test-router-home-back-url",
          content: () => html`
            <a href="${router.guardUrl()}">Child</a>
          `,
        };

        define({
          tag: "test-router-app-back-url",
          views: router([Home]),
          content: ({ views }) => html`${views}` // prettier-ignore
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
        const ChildUnguarded = { tag: "test-router-child-unguarded" };

        define({
          tag: "test-router-app-unguarded",
          views: router([
            {
              [router.connect]: {
                stack: [ChildUnguarded],
                guard: () => true,
              },
              tag: "test-router-home-view-unguarded",
            },
          ]),
          content: ({ views }) => html`${views}` // prettier-ignore
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
        ChildView = {
          [router.connect]: {
            url: "/child",
          },
          tag: "test-router-child-view",
        };

        OtherChildView = {
          tag: "test-router-other-child-view",
          [router.connect]: {
            url: "/other_child",
          },
          content: () =>
            html`
              <a href="${router.url(RootView)}" id="RootView">RootView</a>
            `,
        };

        RootView = {
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
        };

        define({
          tag: "test-router-app-guard-url",
          views: router([RootView]),
          content: ({ views }) => html`${views}` // prettier-ignore
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
});

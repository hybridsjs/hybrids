import { define, router, html } from "../../src/index.js";
import { resolveRaf, resolveTimeout } from "../helpers.js";

const browserUrl = window.location.pathname;

describe("router:", () => {
  let NestedOne;
  let NestedTwo;
  let Child;
  let OtherChild;
  let OtherURLChild;
  let Dialog;
  let Home;
  let host;

  beforeEach(done => {
    OtherChild = {
      [router.connect]: {
        url: "/other_child/:otherId/test?param",
      },
      tag: "test-router-other-child",
      otherId: "",
      param: false,
      otherParam: "",
      content: () => html`
        <a href="${router.backUrl()}">Back</a>
        <a href="${router.url(Home, { scrollToTop: true })}">Home</a>
      `,
    };

    NestedTwo = {
      [router.connect]: { url: "/nested-two?some" },
      tag: "test-router-child-nested-two",
      some: "test",
    };

    NestedOne = {
      [router.connect]: {
        stack: [NestedTwo],
      },
      tag: "test-router-child-nested-one",
      render: () => html`
        <div
          class="overflow"
          style="height: 100px; overflow: scroll"
          tabindex="0"
        >
          <div style="height: 300px"></div>
        </div>
      `,
    };

    Child = {
      [router.connect]: {
        stack: [OtherChild],
      },
      tag: "test-router-child",
      nested: router([NestedOne]),
      render: () =>
        html`
          <slot></slot>
        `,
      content: ({ nested }) => html`
        <a href="${router.backUrl()}">Back</a>
        <a href="${router.url(OtherChild, { otherId: "1" })}">OtherChild</a>
        <a
          id="nested-two-link"
          href="${router.url(NestedTwo, { some: "value" })}"
          >NestedTwo</a
        >
        ${nested}
      `,
    };

    OtherURLChild = {
      [router.connect]: {
        url: "/other_url_child",
      },
      tag: "test-router-other-url-child",
      param: "",
      otherParam: "",
      content: () => html`
        <a href="${router.backUrl()}">Back</a>
      `,
    };

    Dialog = {
      [router.connect]: {
        dialog: true,
      },
      tag: "test-router-dialog",
      content: () => html`
        <p>Dialog</p>
        <a href="${router.backUrl()}">Back</a>
      `,
    };

    Home = {
      [router.connect]: {
        stack: [Child, OtherURLChild, OtherChild, Dialog],
      },
      tag: "test-router-home",
      content: () => html`
        <a href="${router.url(Child)}">Child</a>
        <a href="${router.url(OtherChild, { otherId: "1" })}">Child</a>
        <a id="dialog-link" href="${router.url(Dialog)}">Dialog</a>
        <div
          class="overflow"
          style="height: 100px; overflow: scroll"
          tabindex="0"
        >
          <div style="height: 300px"></div>
        </div>
        <input type="text" />
        <a href="${router.currentUrl()}">Home</a>
      `,
    };

    define({
      tag: "test-router-app",
      views: router([Home]),
      content: ({ views }) => html`${views}` // prettier-ignore
    });

    window.history.replaceState(null, "", browserUrl);
    resolveRaf(() => {
      host = document.createElement("test-router-app");
      document.body.appendChild(host);
      resolveRaf(done);
    });
  });

  afterEach(() => {
    const parent = host.parentElement;
    if (parent) {
      parent.removeChild(host);
    }
    window.history.replaceState(null, "", browserUrl);
  });

  describe("connect root router -", () => {
    it("throws for wrong arguments", () => {
      host.parentElement.removeChild(host);

      const el = document.createElement("div");
      expect(() => router().connect(el)).toThrow();
      expect(() => router(() => "test").connect(el)).toThrow();
    });

    it("throws when connecting root router twice", () => {
      expect(() => {
        const anotherHost = document.createElement("test-router-app");
        anotherHost.connectedCallback();
      }).toThrow();
    });

    it("throws when views have circular reference", () => {
      host.parentElement.removeChild(host);
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
      host.parentElement.removeChild(host);

      expect(() =>
        router([
          {
            [router.connect]: { dialog: true, url: "/home" },
            tag: "test-router-dialog-throw",
          },
        ]).connect(document.createElement("div")),
      ).toThrow();
    });

    it("throws when dialog has 'stack' option", () => {
      host.parentElement.removeChild(host);

      expect(() =>
        router([
          {
            [router.connect]: { dialog: true, stack: [] },
            tag: "test-router-dialog-throw",
          },
        ]).connect(document.createElement("div")),
      ).toThrow();
    });

    it("throws when view 'url' option is not a string", () => {
      host.parentElement.removeChild(host);

      expect(() =>
        router([
          {
            [router.connect]: { url: true },
            tag: "test-router-url-throw",
          },
        ]).connect(document.createElement("div")),
      ).toThrow();
    });

    it("throws when view does not support browser url option", () => {
      host.parentElement.removeChild(host);

      expect(() =>
        router([
          {
            [router.connect]: { url: "/test?open" },
            tag: "test-router-url-throw",
          },
        ]).connect(document.createElement("div")),
      ).toThrow();
    });

    it("throws when view does not support browser url option", () => {
      host.parentElement.removeChild(host);

      expect(() =>
        router([
          {
            [router.connect]: { url: "/:userId" },
            userId: () => "test",
            tag: "test-router-url-throw",
          },
        ]).connect(document.createElement("div")),
      ).toThrow();
    });

    it("returns empty array for not connected host", () => {
      const el = document.createElement("test-router-app");
      expect(el.views).toEqual([]);
    });

    it("displays root view", done => {
      resolveRaf(() => {
        expect(host.views[0].constructor.hybrids).toBe(Home);
        expect(host.children[0].constructor.hybrids).toBe(Home);
      }).then(done);
    });

    it("does not match URL and displays root view", () => {
      host.parentElement.removeChild(host);
      window.history.replaceState(null, "", "/other_child/1");
      return resolveRaf(() => {
        document.body.appendChild(host);

        return resolveRaf(() => {
          expect(window.location.pathname).toBe(browserUrl);
          expect(host.views[0].constructor.hybrids).toBe(Home);
          expect(host.children[0].constructor.hybrids).toBe(Home);
        });
      });
    });

    it("uses view from the history state", done => {
      resolveRaf(() => {
        const el = host.children[0].children[0];
        el.click();
        return resolveRaf(() => {
          host.parentElement.removeChild(host);
          host = document.createElement("test-router-app");
          document.body.appendChild(host);
          return resolveRaf(() => {
            expect(host.children[0].constructor.hybrids).toBe(Child);
          });
        });
      }).then(done);
    });

    it("resets state to default root view", done => {
      resolveRaf(() => {
        const el = host.children[0].children[0];
        el.click();
        return resolveRaf(() => {
          host.parentElement.removeChild(host);
          const Another = { tag: "test-router-another" };
          define({
            tag: "test-router-app",
            views: router([Another]),
            content: ({ views }) => html`${views}` // prettier-ignore
          });
          host = document.createElement("test-router-app");
          document.body.appendChild(host);
          return resolveRaf(() => {
            expect(host.children[0].constructor.hybrids).toBe(Another);
          });
        });
      }).then(done);
    });

    it("resets state to previously connected view", () =>
      resolveRaf(() => {
        const el = host.children[0].children[0];
        el.click();
        return resolveRaf(() => {
          host.parentElement.removeChild(host);
          Home = { tag: "test-router-home" };
          define({
            tag: "test-router-app",
            views: router([Home]),
            content: ({ views }) => html`${views}` // prettier-ignore
          });
          host = document.createElement("test-router-app");
          document.body.appendChild(host);
          return resolveRaf(() => {
            expect(host.children[0].constructor.hybrids).toBe(Home);
          });
        });
      }));

    it("saves and restores scroll position", () => {
      host.style.height = "200vh";
      host.style.width = "200vw";
      host.style.display = "block";

      document.scrollingElement.scrollTop = 200;
      document.scrollingElement.scrollLeft = 200;

      let el = host.children[0].children[0];
      el.click();

      return resolveRaf(() => {
        expect(document.scrollingElement.scrollTop).toBe(0);
        expect(document.scrollingElement.scrollLeft).toBe(0);

        el = host.children[0].children[0];
        el.click();

        return resolveRaf(() => {
          expect(document.scrollingElement.scrollTop).toBe(200);
          expect(document.scrollingElement.scrollLeft).toBe(200);

          el = host.children[0].children[1];
          el.click();

          return resolveRaf(() => {
            el = host.children[0].children[1];
            el.click();

            return resolveRaf(() => {
              expect(host.views[0].constructor.hybrids).toBe(Home);
              expect(document.scrollingElement.scrollTop).toBe(0);
              expect(document.scrollingElement.scrollLeft).toBe(0);
            });
          });
        });
      });
    });

    it("does not change focus element", () => {
      const input = host.querySelector("input");
      input.focus();
      let el = host.children[0].children[0];
      el.click();

      return resolveRaf(() => {
        el = host.children[0].children[0];
        el.click();

        return resolveRaf(() => {
          expect(document.activeElement).toBe(input);
        });
      });
    });
  });

  describe("connect nested router", () => {
    beforeEach(() => {
      host.parentElement.removeChild(host);
    });

    it("throws for more than one nested router in the definition", () => {
      const NestedView = { tag: "test-router-nested-root-nested-view" };
      const RootView = {
        tag: "test-router-nested-root-view",
        nested: router([NestedView]),
        nestedTwo: router([NestedView]),
      };
      define({
        tag: "test-router-app",
        views: router([RootView]),
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
      const RootView = {
        [router.connect]: { stack: [DialogView] },
        tag: "test-router-nested-root-view",
        nested: router([NestedView]),
      };
      define({
        tag: "test-router-app",
        views: router([RootView]),
      });
      const el = document.createElement("test-router-app");
      expect(() => el.connectedCallback()).toThrow();
    });

    it("throws when parent view has 'url' option", () => {
      const NestedView = { tag: "test-router-nested-root-nested-view" };
      const RootView = {
        [router.connect]: {
          url: "/",
        },
        tag: "test-router-nested-root-view",
        nested: router([NestedView]),
      };
      define({
        tag: "test-router-app",
        views: router([RootView]),
      });
      const el = document.createElement("test-router-app");
      expect(() => el.connectedCallback()).toThrow();
    });
  });

  describe("navigate -", () => {
    it("navigates to Child and go back to Home", () =>
      resolveRaf(() => {
        let el = host.children[0].children[0];
        el.click();
        return resolveRaf(() => {
          expect(host.views[0].constructor.hybrids).toBe(Child);
          expect(host.children[0].constructor.hybrids).toBe(Child);
          expect(window.history.state.length).toBe(2);

          el = host.children[0].children[0];
          el.click();

          return resolveRaf(() => {
            expect(host.views[0].constructor.hybrids).toBe(Home);
            expect(host.children[0].constructor.hybrids).toBe(Home);
            expect(window.history.state.length).toBe(1);
          });
        });
      }));

    it("navigates to Child and push state with OtherChild", () =>
      resolveRaf(() => {
        let el = host.children[0].children[0];
        el.click();
        return resolveRaf(() => {
          el = host.children[0].children[1];
          el.click();

          return resolveRaf(() => {
            expect(host.views[0].constructor.hybrids).toBe(OtherChild);
            expect(host.children[0].constructor.hybrids).toBe(OtherChild);
            expect(window.history.state.length).toBe(3);
          });
        });
      }));

    it("navigates to Child and goes to NestedTwo", () =>
      resolveRaf(() => {
        let el = host.children[0].children[0];
        el.click();
        return resolveRaf(() => {
          el = document.getElementById("nested-two-link");
          el.click();

          return resolveRaf(() => {
            expect(host.views[0].constructor.hybrids).toBe(Child);
            expect(host.children[0].constructor.hybrids).toBe(Child);

            expect(host.views[0].nested[0].constructor.hybrids).toBe(NestedTwo);
            expect(host.views[0].nested[0].some).toBe("value");
            expect(window.history.state.length).toBe(3);
          });
        });
      }));

    it("navigates to Dialog and go back to Home by link", () =>
      resolveRaf(() => {
        let el = host.querySelector("#dialog-link");
        el.click();
        return resolveRaf(() => {
          expect(host.views[0].constructor.hybrids).toBe(Home);
          expect(host.children[0].constructor.hybrids).toBe(Home);
          expect(host.views[1].constructor.hybrids).toBe(Dialog);
          expect(host.children[1].constructor.hybrids).toBe(Dialog);
          expect(window.history.state.length).toBe(2);

          el = host.children[1].querySelector("a");
          el.click();

          return resolveRaf(() => {
            expect(host.views[0].constructor.hybrids).toBe(Home);
            expect(host.children[0].constructor.hybrids).toBe(Home);
            expect(window.history.state.length).toBe(1);
          });
        });
      }));

    it("navigates to Dialog and go back to Home by keyboard", () =>
      resolveRaf(() => {
        const el = host.querySelector("#dialog-link");
        el.click();
        return resolveRaf(() => {
          expect(host.views[0].constructor.hybrids).toBe(Home);
          expect(host.children[0].constructor.hybrids).toBe(Home);
          expect(host.views[1].constructor.hybrids).toBe(Dialog);
          expect(host.children[1].constructor.hybrids).toBe(Dialog);
          expect(window.history.state.length).toBe(2);

          const keyEventEsc = new KeyboardEvent("keydown", { key: "Escape" });
          const keyEventEnter = new KeyboardEvent("keydown", { key: "Enter" });
          host.children[1].dispatchEvent(keyEventEnter);
          host.children[1].dispatchEvent(keyEventEsc);

          return resolveRaf(() => {
            expect(host.views[0].constructor.hybrids).toBe(Home);
            expect(host.children[0].constructor.hybrids).toBe(Home);
            expect(window.history.state.length).toBe(1);
          });
        });
      }));

    it("saves and restores scroll position and focus element", () =>
      resolveRaf(() => {
        const div = host.querySelector(".overflow");
        expect(div.scrollTop).toBe(0);
        div.scrollTop = 150;

        div.focus();

        // Go to "Child"
        let el = host.children[0].children[0];
        el.click();

        return resolveRaf(() => {
          const nestedDiv = host
            .querySelector("test-router-child-nested-one")
            .render()
            .querySelector(".overflow");

          expect(nestedDiv.scrollTop).toBe(0);
          nestedDiv.scrollTop = 150;

          // Go to "Other Child"
          el = host.children[0].children[1];
          el.click();

          return resolveRaf(() => {
            // Back to Child
            el = host.children[0].children[0];
            el.click();

            return resolveTimeout(() => {
              expect(
                host
                  .querySelector("test-router-child-nested-one")
                  .render()
                  .querySelector(".overflow"),
              ).toBe(nestedDiv);

              expect(nestedDiv.scrollTop).toBe(150);

              // Back to Home
              el = host.children[0].children[0];
              el.click();

              return resolveTimeout(() => {
                expect(host.querySelector(".overflow")).toBe(div);
                expect(div.scrollTop).toBe(150);
                expect(document.activeElement).toBe(div);
              });
            });
          });
        });
      }));
  });

  describe("url() -", () => {
    it("returns empty string for not connected view", () => {
      const MyElement = { tag: "test-router-my-element" };
      expect(router.url(MyElement)).toBe("");
    });

    describe("without 'url' option", () => {
      it("returns URL with hash for view with not set 'url' option", () => {
        const url = router.url(Home);
        expect(url).toBeInstanceOf(URL);
        expect(url.hash).toBe("#@test-router-home");
      });
    });

    describe("with 'url' option", () => {
      it("throws for duplicated parameters in URL", () => {
        const desc = router([
          {
            [router.connect]: { url: "/:test?test" },
            tag: "test-router-url-error",
          },
        ]);
        host.parentElement.removeChild(host);
        expect(() =>
          desc.connect(document.createElement("div"), "test", () => {}),
        ).toThrow();
      });

      it("throws an error for missing parameter", () => {
        expect(() => router.url(OtherChild, { otherParam: 1 })).toThrow();
      });

      it("does not throws an error when set meta parameter", () => {
        expect(() =>
          router.url(OtherURLChild, { scrollToTop: true }),
        ).not.toThrow();
      });

      it("returns URL with pathname", () => {
        const url = router.url(OtherURLChild);
        expect(url).toBeInstanceOf(URL);
        expect(url.hash).toBe("");
        expect(url.pathname).toBe("/other_url_child");
        expect(url.search).toBe("");
      });

      it("returns URL with parameter and search", () => {
        const url = router.url(OtherChild, { otherId: 1, param: false });
        expect(url).toBeInstanceOf(URL);
        expect(url.hash).toBe("");
        expect(url.pathname).toBe("/other_child/1/test");
        expect(url.search).toBe("?param=");
      });
    });
  });

  describe("backUrl() -", () => {
    it("returns an empty string when no router is connected", () => {
      window.history.replaceState(null, "");
      expect(router.backUrl()).toBe("");
    });

    it("returns back url for nested view", () =>
      resolveRaf(() => {
        let el = host.children[0].children[0];
        el.click();
        return resolveRaf(() => {
          el = document.getElementById("nested-two-link");
          el.click();

          return resolveRaf(() => {
            expect(host.views[0].constructor.hybrids).toBe(Child);
            expect(host.children[0].constructor.hybrids).toBe(Child);

            expect(router.backUrl().hash).toBe("#@test-router-home");
            expect(
              router
                .backUrl({ scrollToTop: true })
                .hash.includes("scrollToTop"),
            ).toBe(true);
            expect(router.backUrl({ nested: true }).hash).toBe(
              "#@test-router-child-nested-one",
            );
          });
        });
      }));
  });

  describe("guardUrl() -", () => {
    it("returns an empty string when no router is connected", () => {
      window.history.replaceState(null, "");
      expect(router.guardUrl()).toBe("");
    });

    it("returns an url to the first stacked view", () =>
      resolveRaf(() => {
        expect(router.guardUrl().hash).toBe("#@test-router-child");

        const el = host.children[0].children[1];
        el.click();
        return resolveRaf(() => {
          expect(router.guardUrl()).toBe("");
        });
      }));

    describe("for guarded view", () => {
      let guardFlag;

      beforeEach(() => {
        host.parentElement.removeChild(host);

        guardFlag = false;

        Child = {
          [router.connect]: {
            url: "/child",
          },
          tag: "test-router-child",
          content: () =>
            html`
              <a href="${router.url(Home)}">Home</a>
            `,
        };

        Home = {
          [router.connect]: {
            stack: [Child],
            guard: () => {
              if (!guardFlag) throw Error("guard failed");
              return guardFlag;
            },
          },
          tag: "test-router-home",
          content: () => html`
            <a href="${router.guardUrl()}">Child</a>
          `,
        };

        define({
          tag: "test-router-app",
          views: router([Home]),
          content: ({ views }) => html`${views}` // prettier-ignore
        });

        window.history.replaceState(null, "", "/child");

        host = document.createElement("test-router-app");
        document.body.appendChild(host);

        return resolveRaf(() => {});
      });

      it("shows parent guarded view and navigate to child", () => {
        expect(host.views[0].constructor.hybrids).toBe(Home);

        let el = host.children[0].children[0];

        expect(el.pathname).toBe("/child");
        el.click();

        return resolveRaf(() => {
          expect(host.views[0].constructor.hybrids).toBe(Home);
          guardFlag = true;

          el.click();

          return resolveRaf(() => {
            expect(host.views[0].constructor.hybrids).toBe(Child);
            el = host.children[0].children[0];

            expect(el.hash).toBe("#@test-router-home");
            el.click();

            return resolveRaf(() => {
              expect(host.views[0].constructor.hybrids).toBe(Child);
              expect(host.children[0].constructor.hybrids).toBe(Child);
            });
          });
        });
      });
    });
  });

  describe("currentUrl() -", () => {});
  describe("resolve() -", () => {});
  describe("active() -", () => {});
});

import { define, router, html } from "../../src/index.js";
import { resolveRaf, resolveTimeout } from "../helpers.js";

const browserUrl = window.location.pathname;

describe("router:", () => {
  let NestedOne;
  let NestedTwo;
  let Child;
  let OtherChild;
  let OtherURLChild;
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

    NestedOne = {
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
    NestedTwo = { tag: "test-router-child-nested-two" };

    Child = {
      [router.connect]: {
        stack: [OtherChild],
      },
      tag: "test-router-child",
      nested: router([NestedOne, NestedTwo]),
      render: () =>
        html`
          <slot></slot>
        `,
      content: ({ nested }) => html`
        <a href="${router.backUrl()}">Back</a>
        <a href="${router.url(OtherChild, { otherId: "1" })}">OtherChild</a>
        <a id="nested-two-link" href="${router.url(NestedTwo)}">NestedTwo</a>
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

    Home = {
      [router.connect]: {
        stack: [Child, OtherURLChild, OtherChild],
      },
      tag: "test-router-home",
      content: () => html`
        <a href="${router.url(Child)}">Child</a>
        <a href="${router.url(OtherChild, { otherId: "1" })}">Child</a>
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

    it("resets state to previously connected view", done => {
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
      }).then(done);
    });

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
            expect(window.history.state.length).toBe(2);
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
      it("throws an error when set not supported parameter", () => {
        expect(() => router.url(Home, { param: 1 })).toThrow();
      });

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

      it("throws an error when set not supported parameter", () => {
        expect(() =>
          router.url(OtherChild, { otherId: "1", otherParam: 1 }),
        ).toThrow();
      });

      it("throws an error when set not supported parameter", () => {
        expect(() => router.url(OtherURLChild, { param: 1 })).toThrow();
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

  describe("resolve() -", () => {});
  describe("backUrl() -", () => {});
  describe("guardUrl() -", () => {});
  describe("currentUrl() -", () => {});
  describe("active() -", () => {});
});

import { define, router, html } from "../../src/index.js";
import { resolveRaf } from "../helpers.js";

const browserUrl = window.location.pathname;

describe("router:", () => {
  let NestedOne;
  let NestedTwo;
  let Child;
  let OtherChild;
  let OtherURLChild;
  let Home;
  let App;
  let host;

  beforeEach(done => {
    OtherChild = define("test-router-other-child", {
      [router.connect]: {
        url: "/other_child/:otherId/test?param",
      },
      otherId: "",
      param: false,
      otherParam: "",
      content: () => html`
        <a href="${router.backUrl()}">Back</a>
      `,
    });

    NestedOne = define("test-router-child-nested-one", {});
    NestedTwo = define("test-router-child-nested-two", {});

    Child = define("test-router-child", {
      nested: router([NestedOne, NestedTwo]),
      content: ({ nested }) => html`
        <a href="${router.backUrl()}">Back</a>
        <a href="${router.url(OtherChild, { otherId: "1" })}">OtherChild</a>
        <a id="nested-two-link" href="${router.url(NestedTwo)}">NestedTwo</a>
        ${nested}
      `,
    });

    OtherURLChild = define("test-router-other-url-child", {
      [router.connect]: {
        url: "/other_url_child",
      },
      param: "",
      otherParam: "",
      content: () => html`
        <a href="${router.backUrl()}">Back</a>
      `,
    });

    Home = define("test-router-home", {
      [router.connect]: {
        stack: [Child, OtherURLChild, OtherChild],
      },
      content: () => html`
        <a href="${router.url(Child)}">Child</a>
        <a href="${router.url(OtherChild, { otherId: "1" })}">Child</a>
      `,
    });

    App = define("test-router-app", {
      views: router([Home]),
      content: ({ views }) => html`${views}` // prettier-ignore
    });

    window.history.replaceState(null, "", browserUrl);
    resolveRaf(() => {
      host = new App();
      document.body.appendChild(host);
      done();
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
    it("displays root view", done => {
      resolveRaf(() => {
        expect(host.views[0]).toBeInstanceOf(Home);
        expect(host.children[0]).toBeInstanceOf(Home);
      }).then(done);
    });

    it("does not match URL and displays root view", () => {
      host.parentElement.removeChild(host);
      window.history.replaceState(null, "", "/other_child/1");
      return resolveRaf(() => {
        document.body.appendChild(host);

        return resolveRaf(() => {
          expect(window.location.pathname).toBe(browserUrl);
          expect(host.views[0]).toBeInstanceOf(Home);
          expect(host.children[0]).toBeInstanceOf(Home);
        });
      });
    });

    it("uses view from the history state", done => {
      resolveRaf(() => {
        const el = host.children[0].children[0];
        el.click();
        return resolveRaf(() => {
          host.parentElement.removeChild(host);
          host = new App();
          document.body.appendChild(host);
          return resolveRaf(() => {
            expect(host.children[0]).toBeInstanceOf(Child);
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
          const Another = define("test-router-another", {});
          App = define("test-router-app", {
            views: router([Another]),
            content: ({ views }) => html`${views}` // prettier-ignore
          });
          host = new App();
          document.body.appendChild(host);
          return resolveRaf(() => {
            expect(host.children[0]).toBeInstanceOf(Another);
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
          Home = define("test-router-home", {});
          App = define("test-router-app", {
            views: router([Home]),
            content: ({ views }) => html`${views}` // prettier-ignore
          });
          host = new App();
          document.body.appendChild(host);
          return resolveRaf(() => {
            expect(host.children[0]).toBeInstanceOf(Home);
          });
        });
      }).then(done);
    });
  });

  describe("navigate -", () => {
    it("navigates to Child and go back to Home", () =>
      resolveRaf(() => {
        let el = host.children[0].children[0];
        el.click();
        return resolveRaf(() => {
          expect(host.views[0]).toBeInstanceOf(Child);
          expect(host.children[0]).toBeInstanceOf(Child);
          expect(window.history.state.length).toBe(2);

          el = host.children[0].children[0];
          el.click();

          return resolveRaf(() => {
            expect(host.views[0]).toBeInstanceOf(Home);
            expect(host.children[0]).toBeInstanceOf(Home);
            expect(window.history.state.length).toBe(1);
          });
        });
      }));

    it("navigates to Child and replace state with OtherChild", () =>
      resolveRaf(() => {
        let el = host.children[0].children[0];
        el.click();
        return resolveRaf(() => {
          el = host.children[0].children[1];
          el.click();

          return resolveRaf(() => {
            expect(host.views[0]).toBeInstanceOf(OtherChild);
            expect(host.children[0]).toBeInstanceOf(OtherChild);
            expect(window.history.state.length).toBe(2);
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
            expect(host.views[0]).toBeInstanceOf(Child);
            expect(host.children[0]).toBeInstanceOf(Child);

            expect(host.views[0].nested[0]).toBeInstanceOf(NestedTwo);
            expect(window.history.state.length).toBe(2);
          });
        });
      }));
  });

  describe("url() -", () => {
    it("returns empty string for not connected view", () => {
      const MyElement = define("test-router-my-element", {});
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
          define("test-router-url-error", {
            [router.connect]: { url: "/:test?test" },
          }),
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

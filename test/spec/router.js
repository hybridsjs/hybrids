import { define, router, html } from "../../src/index.js";
import { resolveRaf } from "../helpers.js";

describe("router:", () => {
  let Nested;
  let Child;
  let OtherChild;
  let Home;
  let App;
  let host;

  beforeEach(() => {
    OtherChild = define("test-router-child", {
      content: () => html`
        <a href="${router.backUrl()}">Back</a>
      `,
    });

    Nested = define("test-router-child-nested", {});

    Child = define("test-router-child", {
      nested: router([Nested]),
      content: ({ nested }) => html`
        <a href="${router.backUrl()}">Back</a>
        <a href="${router.url(OtherChild)}">OtherChild</a>
        ${nested}
      `,
    });

    Home = define("test-router-home", {
      [router.connect]: { stack: [Child, OtherChild] },
      content: () => html`
        <a href="${router.url(Child)}">Child</a>
        <a href="${router.url(OtherChild)}">Child</a>
      `,
    });

    App = define("test-router-app", {
      views: router([Home]),
      content: ({ views }) => html`${views}` // prettier-ignore
    });

    window.history.replaceState(null, "");
    host = new App();
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.parentElement.removeChild(host);
  });

  describe("connect root router -", () => {
    it("displays root view", done => {
      resolveRaf(() => {
        expect(host.views[0]).toBeInstanceOf(Home);
        expect(host.children[0]).toBeInstanceOf(Home);
      }).then(done);
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
    it("navigates to Child and go back to Home", done => {
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
      }).then(done);
    });

    it("navigates to Child and replace state with OtherChild", done => {
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
      }).then(done);
    });
  });

  describe("url() -", () => {
    it("returns empty string for not connected view", () => {
      const MyElement = define("test-router-my-element", {});
      expect(router.url(MyElement)).toBe("");
    });
  });

  describe("resolve() -", () => {});
  describe("backUrl() -", () => {});
  describe("guardUrl() -", () => {});
  describe("currentUrl() -", () => {});
  describe("active() -", () => {});
});

import { localize, msg, clear } from "../../src/localize.js";
import { html } from "../../src/template/index.js";

describe("localize:", () => {
  afterEach(() => {
    clear();
  });

  it("localize throws error for wrong arguments", () => {
    expect(() => localize(null)).toThrow();
    expect(() => localize("default", null)).toThrow();
  });

  it("returns an array of the language list", () => {
    expect(localize.languages.length).toBeGreaterThan(0);
  });

  describe("without dictionary -", () => {
    it("returns the key", () => {
      expect(msg`text only`).toBe("text only");
    });

    it("uses translate function", () => {
      const spy = jasmine.createSpy();
      localize((...args) => {
        spy(...args);
        return args[0];
      });
      expect(msg`text only`).toBe("text only");
      expect(spy).toHaveBeenCalledWith("text only", "");
    });

    it("uses translate function in chrome.i18n format", () => {
      const spy = jasmine.createSpy();
      spyOn(console, "warn");

      localize(
        (...args) => {
          spy(...args);
          return "";
        },
        { format: "chrome.i18n" },
      );
      expect(msg`text only ${0}`).toBe("text only 0");
      expect(msg`text only ${0} | desc | context`).toBe("text only 0");
      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith("text_only_@_0_", "");
    });
  });

  describe("with dictionary -", () => {
    beforeEach(() => {
      localize("default", {
        "text only": {
          message: "tylko tekst",
        },
        "text only | context": {
          message: "tylko tekst i kontekst",
        },
        "text and ${0} ${1}": {
          message: "${0} i tekst",
        },
        "text to expression ${0}": {
          message: "${0}",
        },
        "plural ${0}": {
          message: {
            one: "${0} jeden",
            other: "${0} inne",
          },
        },
        "wrong plural ${0}": {
          message: {},
        },
        'with link <a href="#">link</a>': {
          message: 'z linkiem <a href="#">link</a>',
        },
        'with link <a href="${0}">link</a>': {
          message: 'z linkiem <a href="${0}">link</a>',
        },
      });
    });

    it("msg returns translated message", () => {
      localize(localize.languages[0], {
        "text only": { message: "haha" },
      });

      expect(msg`text    only`).toBe("haha");
      expect(msg`text only`).toBe("haha");
      expect(msg`text and ${123} ${321}`).toBe("123 i tekst");
      expect(msg`plural ${0}`).toBe("0 inne");
      expect(msg`wrong plural ${0}`).toBe("");
    });

    it("msg returns translated message using optional context", () => {
      expect(msg`text and ${123} ${321} || context`).toBe("123 i tekst");
    });

    it("msg returns passed key when no translation is found", () => {
      spyOn(console, "warn");
      expect(msg`no translation`).toBe("no translation");
      expect(msg`no translation | description | context`).toBe(
        "no translation",
      );
      expect(console.warn).toHaveBeenCalledTimes(2);
    });

    it("msg.html interprets elements", () => {
      const el = document.createElement("div");
      msg.html`with link <a href="#">link</a>`(el);

      expect(el.innerHTML).toBe('z linkiem <a href="#">link</a>');
    });

    it("msg.html supports expressions", () => {
      const el = document.createElement("div");
      msg.html`with link <a href="${"test"}">link</a>`(el);
      expect(el.innerHTML).toBe('z linkiem <a href="test">link</a>');

      msg.html`with link <a href="${"test"}">link</a>`(el);
      expect(el.innerHTML).toBe('z linkiem <a href="test">link</a>');
    });

    it("msg.svg interprets elements", () => {
      const el = document.createElement("div");

      msg.svg`with link <a href="#">link</a>`(el);
      expect(el.innerHTML).toBe('z linkiem <a href="#">link</a>');

      msg.svg`with link <a href="#">link</a>`(el);
      expect(el.innerHTML).toBe('z linkiem <a href="#">link</a>');
    });

    it("msg.svg supports expressions", () => {
      const el = document.createElement("div");
      msg.svg`with link <a href="${"test"}">link</a>`(el);

      expect(el.innerHTML).toBe('z linkiem <a href="test">link</a>');
    });

    it("uses translate function when message is not found", () => {
      const spy = jasmine.createSpy();
      localize((...args) => {
        spy(...args);
        return args[0];
      });
      expect(msg`text only`).toBe("tylko tekst");
      expect(spy).not.toHaveBeenCalled();

      expect(msg`no translation`).toBe("no translation");
      expect(spy).toHaveBeenCalledWith("no translation", "");
    });

    describe("in template engine -", () => {
      let el;
      beforeEach(() => {
        el = document.createElement("div");
      });

      it("translates the text content", () => {
        // prettier-ignore
        html`<div>text only</div>`(el);
        expect(el.innerHTML).toBe("<div>tylko tekst</div>");
      });

      it("translates the text content with context from a comment", () => {
        // prettier-ignore
        html`
          <div>
            <!-- description | context -->
            
            text only
          </div>
        `(el);
        expect(el.innerHTML).toContain("tylko tekst");
      });

      it("translates messages separated by the comment", () => {
        // prettier-ignore
        html`
          <div>
            <!-- description | context -->
            text only
            <!-- description -->
            text and ${123} ${321}
          </div>
          <div>
            text and ${321} ${321}
          </div>
          <div>
            text to expression ${123}
          </div>
          <div>
            123 $$$
          </div>
        `(el);
        expect(el.children[0].childNodes[1].textContent.trim()).toBe(
          "tylko tekst i kontekst",
        );
        expect(el.children[0].innerHTML).toContain("123 i tekst");
        expect(el.children[1].innerHTML.trim()).toEqual("321 i tekst");
        expect(el.children[2].innerHTML.trim()).toEqual("123");
        expect(el.children[3].innerHTML.trim()).toEqual("123 $$$");
      });

      it("omits nodes where translate attribute is set to 'no' or script and style", () => {
        // prettier-ignore
        html`
          <div translate="no">
            text only
            <span>
              text and ${123}
            </span>
          </div>
          <script>text only</script>
          <style>text only</style>
          <div>text only</div>
        `(el);
        expect(el.children[0].childNodes[0].textContent.trim()).toBe(
          "text only",
        );
        expect(el.children[0].children[0].innerHTML.trim()).toBe(
          "text and 123",
        );
        expect(el.children[1].innerHTML.trim()).toBe("text only");
        expect(el.children[2].innerHTML.trim()).toBe("text only");
        expect(el.children[3].innerHTML.trim()).toBe("tylko tekst");
      });
    });
  });
});

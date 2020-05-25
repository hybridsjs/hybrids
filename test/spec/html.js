import { html } from "../../src/template/index.js";
import { createInternalWalker } from "../../src/template/core.js";
import define from "../../src/define.js";
import renderFactory from "../../src/render.js";
import { dispatch } from "../../src/utils.js";
import { test, resolveTimeout } from "../helpers.js";

describe("html:", () => {
  let fragment;

  beforeEach(() => {
    fragment = document.createElement("custom-element");
    document.body.appendChild(fragment);
  });

  afterEach(() => {
    document.body.removeChild(fragment);
  });

  const getArrayValues = f =>
    Array.from(f.children).map(child => child.textContent);

  it("renders static content", () => {
    const render = html`
      <div>static content<!-- some comment --></div>
    `;
    render({}, fragment);
    expect(fragment.children[0].outerHTML).toBe(
      "<div>static content<!-- some comment --></div>",
    );
  });

  it("creates template unique id", () => {
    const renderOne = () =>
      html`
        <div>value:</div>
      `;
    const renderTwo = value =>
      html`
        <div>value:${value}</div>
      `;

    renderOne()({}, fragment);
    renderTwo(0)({}, fragment);

    expect(fragment.children[0].textContent).toBe("value:0");
  });

  it("reuses the same elements when re-render", () => {
    const render = value =>
      html`
        <!-- some comment -->
        <div>${value}</div>
      `;
    render(0)(fragment);
    const div = fragment.children[0];
    render(1)(fragment);

    expect(fragment.children[0]).toBe(div);
    expect(div.innerHTML).toBe("1");
  });

  it("throws for missing custom element in dev environment", () => {
    window.env = "development";
    expect(() =>
      html`
        <missing-element></missing-element>
      `(fragment),
    ).toThrow();
  });

  it("does not throw for missing custom element in prod environment", () => {
    window.env = "production";
    expect(() =>
      html`
        <missing-element></missing-element>
      `(fragment),
    ).not.toThrow();
  });

  it("clears arguments cache when template changes", () => {
    html`
      <div>${10}</div>
    `(fragment);
    html`
      <span>${10}</span>
    `(fragment);
    expect(fragment.children[0].innerHTML).toBe("10");
  });

  it("replaces resolved nested custom element template", done => {
    define("test-replace-trigger", {
      render: renderFactory(
        () =>
          html`
            content
          `,
        { shadowRoot: false },
      ),
    });

    const render = flag =>
      html`
        ${flag &&
          html`
            <test-replace-trigger></test-replace-trigger>
          `}<button></button>
      `;
    render(true)(fragment);

    resolveTimeout(() => {
      render(false)(fragment);
      expect(fragment.children.length).toBe(1);
      done();
    });
  });

  describe("attribute expression with combined text value", () => {
    const render = (two, three) =>
      html`
        <div name="test" class="class-one ${two} ${three}"></div>
      `;

    it("sets attribute", () => {
      render("class-two", "class-three")({}, fragment);
      expect(fragment.children[0].getAttribute("class")).toBe(
        "class-one class-two class-three",
      );
    });

    it("does not set undefined value", () => {
      render()({}, fragment);
      expect(fragment.children[0].getAttribute("class")).toBe("class-one  ");
    });

    it("clears attribute", () => {
      render("class-two", "class-three", "some text")({}, fragment);
      render("", "", "some text")(fragment);
      expect(fragment.children[0].getAttribute("class")).toBe("class-one  ");
    });
  });

  describe("attribute expression with non existing property", () => {
    const render = value =>
      html`
        <div text-property="${value}"></div>
      `;

    beforeEach(() => render("value")(fragment));

    it("sets attribute", () => {
      expect(fragment.children[0].getAttribute("text-property")).toBe("value");
    });

    it("removes property", () => {
      render(false)(fragment);
      expect(fragment.children[0].hasAttribute("text-property")).toBe(false);
    });

    it("re-creates property", () => {
      render(false)(fragment);
      render(true)(fragment);
      expect(fragment.children[0].hasAttribute("text-property")).toBe(true);
      expect(fragment.children[0].getAttribute("text-property")).toBe("");
    });

    it("does not update attribute with the same value", () => {
      const spy = spyOn(fragment.children[0], "setAttribute");
      render("value")(fragment);
      expect(spy).toHaveBeenCalledTimes(0);
    });
  });

  describe("attribute expression with existing property", () => {
    it("sets input properties", () => {
      html`
        <input type="checkbox" checked="  ${true}  " value=${"asd"} />
      `(fragment);
      expect(fragment.children[0].checked).toBe(true);
      expect(fragment.children[0].value).toBe("asd");
    });

    it("sets div hidden property", () => {
      html`
        <div hidden="${false}" dsa="${"one"}" asd="${"two"}"></div>
      `(fragment);
      expect(fragment.children[0].hidden).toBe(false);
      expect(fragment.children[0].getAttribute("dsa")).toBe("one");
      expect(fragment.children[0].getAttribute("asd")).toBe("two");
    });

    it("sets property using camelCase name", () => {
      define("test-html-property", {
        customProperty: 0,
      });

      const render = html`
        <test-html-property title=${""} customProperty=${1}>
        </test-html-property>
      `;

      render(fragment);

      expect(fragment.children[0].customProperty).toBe(1);
    });
  });

  describe("class expression attribute", () => {
    const render = classList =>
      html`
        <div class=${classList}></div>
      `;
    const hasClass = className =>
      fragment.children[0].classList.contains(className);

    it("sets string value", () => {
      render("class-one")(fragment);
      expect(hasClass("class-one")).toBe(true);
    });

    it("sets array value", () => {
      render(["class-one", "class-two"])(fragment);
      expect(hasClass("class-one")).toBe(true);
      expect(hasClass("class-two")).toBe(true);
    });

    it("sets object value", () => {
      render({
        "class-one": true,
        "class-two": true,
        "class-three": false,
      })(fragment);

      expect(hasClass("class-one")).toBe(true);
      expect(hasClass("class-two")).toBe(true);
      expect(hasClass("class-three")).toBe(false);
    });

    it("updates values", () => {
      render(["one", "two", "three"])(fragment);
      render(["one", "four"])(fragment);

      expect(hasClass("one")).toBe(true);
      expect(hasClass("two")).toBe(false);
      expect(hasClass("three")).toBe(false);
      expect(hasClass("four")).toBe(true);
    });
  });

  describe("style expression attribute", () => {
    const renderObject = styleList =>
      html`
        <div style="${styleList}"></div>
      `;
    const renderAttr = text => html`
      <div style="color: red; ${text}" asd="<>/">
        <div style="color: red; ${text}"></div>
      </div>
      <div>this is some text with style = " " style=</div>
    `;

    it("throws for invalid expression value", () => {
      expect(() => {
        renderObject(undefined)(fragment);
      }).toThrow();
    });

    it("sets style property", () => {
      renderObject({ backgroundColor: "red" })(fragment);
      expect(fragment.children[0].style["background-color"]).toBe("red");
    });

    it("removes deleted style property", () => {
      renderObject({ backgroundColor: "red" })(fragment);
      renderObject({})(fragment);
      expect(fragment.children[0].style["background-color"]).toBe("");
    });

    it("removes falsy style property", () => {
      renderObject({ backgroundColor: "red" })(fragment);
      renderObject({ backgroundColor: "" })(fragment);
      expect(fragment.children[0].style["background-color"]).toBe("");
    });

    it("sets attribute", () => {
      renderAttr("background-color: red")(fragment);
      expect(fragment.children[0].style["background-color"]).toBe("red");
      expect(fragment.children[0].children[0].style["background-color"]).toBe(
        "red",
      );
    });

    it('deos not change text content with "style=" [IE]', () => {
      renderAttr()(fragment);
      expect(fragment.children[1].childNodes[0].textContent).toBe(
        'this is some text with style = " " style=',
      );
    });
  });

  describe("event attribute expression", () => {
    const render = value =>
      html`
        <button onclick=${value}></button><button onclick=${value}></button>
      `;
    const renderWithQuotes = value =>
      html`
        <button onclick="${value}"></button>
      `;

    const click = () => fragment.children[0].click();
    let spy;

    beforeEach(() => {
      spy = jasmine.createSpy("event callback");
    });

    it("throws for other type than function and attaches event after", () => {
      expect(() => {
        render({})(fragment);
      }).toThrow();
      render(spy)(fragment);
      click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("attaches event listener", () => {
      render(spy)(fragment);
      click();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.first().args[0]).toBe(fragment);
    });

    it("attaches event listener in quotes", () => {
      renderWithQuotes(spy)(fragment);
      click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("detaches event listener without options", () => {
      render(spy)(fragment);
      click();
      render()(fragment);
      click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("detaches event listener with options", () => {
      spy.options = true;
      render(spy)(fragment);
      click();
      render()(fragment);
      click();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("replaces event listener", () => {
      render(spy)(fragment);
      click();

      const newSpy = jasmine.createSpy("new event callback");
      render(newSpy)(fragment);
      click();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(newSpy).toHaveBeenCalledTimes(1);
    });

    it("applies the third options argument", () => {
      const callback = (host, event) => spy(event.eventPhase);
      callback.options = true;

      html`
        <div onclick="${callback}">
          <button></button>
        </div>
      `(fragment);

      fragment.children[0].children[0].click();
      expect(spy.calls.first().args[0]).toBe(1);
    });
  });

  describe("text content expression", () => {
    const render = (one, two) => html`
      <style>
        div {
          color: red;
        }
      </style>
      <div id="text">values: ${one}, ${two}</div>
    `;

    beforeEach(() => render("one", "two")(fragment));

    it("renders values", () => {
      expect(fragment.querySelector("div").textContent).toBe(
        "values: one, two",
      );
    });

    it("updates values", () => {
      render("two", "one")(fragment);
      expect(fragment.querySelector("div").textContent).toBe(
        "values: two, one",
      );
    });

    it("removes values", () => {
      render(false, null)(fragment);

      expect(fragment.querySelector("div").textContent).toBe("values: , ");
    });
  });

  describe("template content expression", () => {
    const render = flag => html`
      <div>
        value:
        ${flag &&
          html`
            <span>${"one"}</span>
          `}
      </div>
    `;

    beforeEach(() => render(true)({}, fragment));

    it("renders template", () => {
      expect(fragment.children[0].children[0].outerHTML).toBe(
        "<span>one</span>",
      );
    });

    it("removes template", () => {
      render(false)(fragment);
      expect(fragment.children[0].children.length).toBe(0);
    });
  });

  describe("flat array content expression with primitive values", () => {
    const render = items =>
      // eslint-disable-next-line prettier/prettier
      html`${items}`;

    beforeEach(() => {
      render([1, 2, 3])(fragment);
    });

    it("renders an array", () => {
      render([1, 2, 3])(fragment);
      expect(fragment.innerHTML).toBe("123");
    });

    it("re-renders an array", () => {
      expect(fragment.innerHTML).toBe("123");
    });

    it("removes an array", () => {
      render([])(fragment);
      expect(fragment.innerHTML).toBe("");
    });

    it("re-order an array", () => {
      render([3, 1, 2])(fragment);
      expect(fragment.innerHTML).toBe("312");
    });
  });

  describe("flat array content expression", () => {
    const render = items =>
      html`
        ${items &&
          items.map(v =>
            html`
              <span>${v}</span>
            `.key(v),
          )}
      `;

    beforeEach(() => {
      render([1, 2, 3])(fragment);
    });

    it("renders an array", () => {
      expect(getArrayValues(fragment)).toEqual(["1", "2", "3"]);
    });

    it("removes an array", () => {
      render(false)(fragment);

      expect(fragment.childNodes.length).toBe(3);
      expect(getArrayValues(fragment)).toEqual([]);
    });

    it("empties an array", () => {
      render([])(fragment);

      expect(fragment.childNodes.length).toBe(3);
      expect(fragment.children.length).toBe(0);
      expect(getArrayValues(fragment)).toEqual([]);
    });

    it("re-renders an array", () => {
      const items = Array.from(fragment.children);

      render([1, 2, 3, 4])(fragment);
      expect(Array.from(fragment.children).slice(0, 3)).toEqual(items);
      expect(getArrayValues(fragment)).toEqual(["1", "2", "3", "4"]);
    });

    it("pops an array", () => {
      render([1, 2])(fragment);
      expect(getArrayValues(fragment)).toEqual(["1", "2"]);
    });

    it("moves items of an array", () => {
      render([3, 1, 2])(fragment);
      expect(getArrayValues(fragment)).toEqual(["3", "1", "2"]);
    });

    it("reverses an array", () => {
      const firstItem = fragment.children[0];
      render([4, 2, 1])(fragment);

      expect(getArrayValues(fragment)).toEqual(["4", "2", "1"]);
      expect(fragment.children[2]).toBe(firstItem);
    });

    it("reuse DOM elements using string id", () => {
      render(["one", "one", "one", "two"])(fragment);
      const items = Array.from(fragment.children);
      render(["two", "one", "one"])(fragment);
      expect(Array.from(fragment.children)).toEqual([
        items[3],
        items[0],
        items[1],
      ]);
    });

    it("does not throw for duplicated id from key method", () => {
      expect(() => {
        html`
          ${[1, 2, 3].map(() => html``.key(1))}
        `(fragment);
      }).not.toThrow();
    });
  });

  describe("nested array content expression", () => {
    const renderItem = item =>
      // eslint-disable-next-line prettier/prettier
      html`<span>${item}</span>`.key(item);
    const renderArray = array =>
      // eslint-disable-next-line prettier/prettier
      html`${array.map(renderItem)}`.key(array.join(""));
    const render = items =>
      html`
        ${items && items.map(renderArray)} static value
      `;

    beforeEach(() => {
      render([[1, 2, 3], [4, 5, 6], [7]])(fragment);
    });

    it("renders a nested array", () => {
      expect(getArrayValues(fragment)).toEqual([
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ]);
    });

    it("removes a nested array", () => {
      render(false)(fragment);
      expect(fragment.lastChild.textContent.trim()).toBe("static value");
    });

    it("pops a nested array", () => {
      render([
        [1, 2, 3],
        [4, 5, 6],
      ])(fragment);
      expect(getArrayValues(fragment)).toEqual(["1", "2", "3", "4", "5", "6"]);
    });

    it("shifts a nested array", () => {
      render([[4, 5, 6], [7]])(fragment);
      expect(getArrayValues(fragment)).toEqual(["4", "5", "6", "7"]);
    });

    it("unshift a nested array", () => {
      render([[0, 1, 2], [1, 2, 3], [4, 5, 6], [7]])(fragment);
      expect(getArrayValues(fragment)).toEqual([
        "0",
        "1",
        "2",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
      ]);
    });

    it("moves nested array", () => {
      render([[7], [4, 5, 6], [1, 2, 3]])(fragment);
      expect(getArrayValues(fragment)).toEqual([
        "7",
        "4",
        "5",
        "6",
        "1",
        "2",
        "3",
      ]);
    });

    it("re-uses nested array values", () => {
      const item = fragment.children[3];
      render([[4, 5, 6], [7]])(fragment);
      expect(fragment.children[0]).toBe(item);
    });
  });

  describe("multiple nested array content expression", () => {
    const render = array =>
      html`
        ${array.map(item => {
          if (Array.isArray(item)) {
            return render(item);
          }
          return html`
            <span>${item}</span>
          `.key(item);
        })}
      `.key(array.join());

    beforeEach(() => {
      render([1, 2, [3, 4, [5, 6, [7, 8]]]])(fragment);
    });

    it("renders multiple nested arrays", () => {
      expect(getArrayValues(fragment)).toEqual([
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
      ]);
    });

    it("updates multiple nested arrays", () => {
      render([1, 2, [3, 4, 10, [[7, 8], 5, 1, 6]]])(fragment);
      expect(getArrayValues(fragment)).toEqual([
        "1",
        "2",
        "3",
        "4",
        "10",
        "7",
        "8",
        "5",
        "1",
        "6",
      ]);
    });

    it("clears root array and re-render elements", () => {
      const dataStart = [{ id: 1 }, { id: 2 }];
      const dataFiltered = [{ id: 1, children: [{ id: 3 }] }, { id: 2 }];
      const renderData = item =>
        html`
          <span>${item.id}</span>
          ${item.children && item.children.map(renderData)}
        `.key(item.id);

      const renderWrapper = list => html`
        ${list.map(renderData)}
      `;

      renderWrapper(dataFiltered)(fragment);
      renderWrapper(dataStart)(fragment);
      renderWrapper(dataFiltered)(fragment);
    });
  });

  describe("table", () => {
    it("should render table with rows", () => {
      const renderRow = v =>
        html`
          <tr>
            <td>${v}</td>
          </tr>
        `.key(v);
      const renderTable = html`
        <table>
          <tbody>
            ${[1, 2].map(v => renderRow(v))} ${[3, 4].map(v => renderRow(v))}
          </tbody>
        </table>
      `;

      renderTable({}, fragment);
      expect(fragment.children[0].querySelectorAll("td").length).toBe(4);
    });

    it("should set single expression in <tr> element", () => {
      const render = html`
        <table>
          <tbody>
            <tr>
              ${"test"}
            </tr>
          </tbody>
        </table>
      `;

      render({}, fragment);
      expect(fragment.children[0].querySelector("tr").innerHTML.trim()).toBe(
        "test",
      );
    });

    it("should set multiple expression in <tr> element", () => {
      const render = html`
        <table>
          <tbody>
            <tr>
              ${"test 1"} ${"test 2"}
            </tr>
          </tbody>
        </table>
      `;

      render({}, fragment);
      expect(fragment.children[0].querySelector("tr").innerHTML.trim()).toBe(
        "test 1 test 2",
      );
    });

    it("should set <td> inner element property", () => {
      const render = html`
        <table>
          <tbody>
            <tr>
              <td><div class=${"one"}>${"two"}</div></td>
            </tr>
          </tbody>
        </table>
      `;

      render({}, fragment);
      expect(fragment.children[0].querySelector("div.one").innerHTML).toBe(
        "two",
      );
    });
  });

  describe("set helper", () => {
    let host;

    beforeEach(() => {
      host = { firstName: "" };
    });

    it('uses "value" from input', () => {
      const render = html`
        <input type="text" oninput=${html.set("firstName")} />
      `;
      render(host, fragment);

      const input = fragment.children[0];
      input.value = "John";
      dispatch(input, "input");

      expect(host.firstName).toBe("John");
    });

    it("set custom value", () => {
      const render = html`
        <input type="text" oninput=${html.set("firstName", undefined)} />
      `;
      render(host, fragment);

      const input = fragment.children[0];
      dispatch(input, "input");

      expect(host.firstName).toBe(undefined);
    });

    it("saves callback in the cache", () => {
      expect(html.set("value")).toBe(html.set("value"));
      expect(html.set("value")).not.toBe(html.set("otherValue"));
    });

    it("throws if property name is not set", () => {
      expect(() => html.set(undefined)).toThrow();
    });
  });

  describe("resolve helper", () => {
    const render = (promise, value, placeholder) => html`
      ${html.resolve(
        promise.then(
          () =>
            html`
              <div>${value}</div>
            `,
        ),
        placeholder,
      )}
    `;

    it("reuses DOM element", done => {
      const promise = Promise.resolve();
      render(promise, "one")(fragment);

      setTimeout(() => {
        const el = fragment.children[0];

        render(promise, "two")(fragment);

        setTimeout(() => {
          expect(fragment.children[0].textContent).toBe("two");
          expect(fragment.children[0]).toBe(el);
          done();
        }, 100);
      }, 100);
    });

    it("shows placeholder after delay", done => {
      render(
        new Promise(resolve => setTimeout(resolve, 500)),
        "value",
        html`
          <div>loading...</div>
        `,
      )(fragment);

      setTimeout(() => {
        expect(fragment.children[0].textContent).toBe("loading...");

        setTimeout(() => {
          expect(fragment.children[0].textContent).toBe("value");
          done();
        }, 250);
      }, 300);
    });

    it("cancel render previous value", done => {
      render(
        Promise.resolve(),
        "one",
        html`
          <div>loading...</div>
        `,
      )(fragment);
      render(Promise.resolve(), "two")(fragment);

      requestAnimationFrame(() => {
        expect(fragment.children[0].textContent).toBe("two");
        done();
      });
    });
  });

  describe("style method", () => {
    const render = html`
      <div>content</div>
    `;

    it("adds single style with text content", () => {
      const container = fragment.attachShadow({ mode: "open" });

      render.style("div { color: red }")(fragment, container);

      expect(getComputedStyle(container.children[0]).color).toBe(
        "rgb(255, 0, 0)",
      );
    });

    it("adds multiple styles with text content", () => {
      const container = fragment.attachShadow({ mode: "open" });

      render.style("div { color: red }", "div { padding-top: 20px }")(
        fragment,
        container,
      );

      expect(getComputedStyle(container.children[0]).color).toBe(
        "rgb(255, 0, 0)",
      );
      expect(getComputedStyle(container.children[0]).paddingTop).toBe("20px");
    });

    it("adds styles to the shadowRoot by adoptedStyleSheets or style tags", () => {
      const container = fragment.attachShadow({ mode: "open" });
      render.style("div { color: red }")({}, container);

      if (!document.adoptedStyleSheets) {
        expect(container.children.length).toBe(2);
      }

      expect(getComputedStyle(container.children[0]).color).toBe(
        "rgb(255, 0, 0)",
      );

      html`
        <div>content</div>
      `({}, container);

      expect(getComputedStyle(container.children[0]).color).toBe(
        "rgb(0, 0, 0)",
      );

      expect(container.children.length).toBe(1);
    });

    it("adds async styles by style tags to the shadowRoot", done => {
      const container = fragment.attachShadow({ mode: "open" });
      render.style("@import 'style.css'; div { color: red }")({}, container);

      resolveTimeout(() => {
        expect(container.children.length).toBe(2);
        expect(getComputedStyle(container.children[0]).color).toBe(
          "rgb(255, 0, 0)",
        );

        html`
          <div>content</div>
        `({}, container);

        expect(getComputedStyle(container.children[0]).color).toBe(
          "rgb(0, 0, 0)",
        );

        expect(container.children.length).toBe(1);
      }).then(done);
    });

    if (document.adoptedStyleSheets) {
      it("does not replace adoptedStyleSheets array when styles are equal", () => {
        const container = fragment.attachShadow({ mode: "open" });
        render.style("div { color: red }")({}, container);
        const adoptedStyleSheets = container.adoptedStyleSheets;

        render.style("div { color: red }")({}, container);

        expect(container.adoptedStyleSheets[0]).toBe(adoptedStyleSheets[0]);
      });

      it("replaces adoptedStyleSheets array when styles are not equal", () => {
        const container = fragment.attachShadow({ mode: "open" });
        render.style("div { color: red }")({}, container);
        const adoptedStyleSheets = container.adoptedStyleSheets;

        render.style("div { color: blue }")({}, container);

        expect(container.adoptedStyleSheets[0]).not.toBe(adoptedStyleSheets[0]);
      });

      it("adds styles using CSSStyleSheet instance", () => {
        const container = fragment.attachShadow({ mode: "open" });

        const sheet = new CSSStyleSheet();
        sheet.replaceSync("div { color: red }");

        render.style(sheet)({}, container);

        expect(getComputedStyle(container.children[0]).color).toBe(
          "rgb(255, 0, 0)",
        );
      });
    }
  });

  describe("ShadyDOM polyfill", () => {
    it("uses internal TreeWalker", () => {
      const el = document.createElement("div");
      el.innerHTML =
        "<div><div>text</div><div>text<div>text</div></div>text</div>";

      const walker = createInternalWalker(el);
      let index = 0;
      while (walker.nextNode()) {
        expect(walker.currentNode).not.toBeNull();
        index += 1;
      }
      expect(index).toBe(8);
    });
  });

  describe("ShadyCSS custom property scope", () => {
    const TestShadyChild = {
      value: 0,
      render: ({ value }) => html`
        <span>${value}</span>
        <style>
          span {
            color: var(--custom-color);
          }
        </style>
      `,
    };

    const TestShadyParent = {
      active: false,
      render: ({ active }) =>
        html`
          <test-shady-child class="${{ active }}"></test-shady-child>
          <style>
            test-shady-child {
              --custom-color: red;
            }
            test-shady-child.active {
              --custom-color: blue;
            }
          </style>
        `.define({ TestShadyChild }),
    };

    define("test-shady-parent", TestShadyParent);

    const shadyTree = test(`
      <test-shady-parent></test-shady-parent>
    `);

    it(
      "should set custom property",
      shadyTree(el =>
        resolveTimeout(() => {
          const { color } = window.getComputedStyle(
            el.shadowRoot.children[0].shadowRoot.children[0],
          );
          expect(color).toBe("rgb(255, 0, 0)");
        }),
      ),
    );

    it(
      "should update custom property",
      shadyTree(el =>
        resolveTimeout(() => {
          el.active = true;
          return resolveTimeout(() => {
            const { color } = window.getComputedStyle(
              el.shadowRoot.children[0].shadowRoot.children[0],
            );
            expect(color).toBe("rgb(0, 0, 255)");
          });
        }),
      ),
    );
  });

  describe("ShadyCSS encapsulation", () => {
    const render = text => html`
      <div>${text}</div>
      <style>
        div {
          color: red;
        }
      </style>
      <div>${text}</div>
    `;

    it("applies CSS scope", () => {
      const one = document.createElement("custom-element-one");
      const two = document.createElement("custom-element-two");
      const globalElement = document.createElement("div");

      one.attachShadow({ mode: "open" });
      two.attachShadow({ mode: "open" });

      render("test")(one, one.shadowRoot);
      // run second time to check if prepare template is not called twice
      // render('test')(one, one.shadowRoot);

      render("test")(two, two.shadowRoot);

      document.body.appendChild(one);
      document.body.appendChild(two);
      document.body.appendChild(globalElement);

      expect(one.shadowRoot.children[0].innerHTML).toBe("test");
      expect(
        one.shadowRoot.children[one.shadowRoot.children.length - 1].innerHTML,
      ).toBe("test");

      expect(getComputedStyle(one.shadowRoot.children[0]).color).toBe(
        "rgb(255, 0, 0)",
      );
      expect(getComputedStyle(two.shadowRoot.children[0]).color).toBe(
        "rgb(255, 0, 0)",
      );
      expect(getComputedStyle(globalElement).color).toBe("rgb(0, 0, 0)");

      document.body.removeChild(one);
      document.body.removeChild(two);
      document.body.removeChild(globalElement);
    });
  });

  describe("ShadyCSS styleElement hook", () => {
    const shadyCSSApplied = window.ShadyCSS && !window.ShadyCSS.nativeShadow;
    const render = html`
      <div>content</div>
      <style>
        :host {
          color: red;
        }
      </style>
    `;

    beforeEach(() => {
      if (!shadyCSSApplied) {
        window.ShadyCSS = {
          prepareTemplate: template => template,
          styleElement: jasmine.createSpy(),
          styleSubtree: jasmine.createSpy(),
        };
      } else {
        spyOn(window.ShadyCSS, "styleElement");
        spyOn(window.ShadyCSS, "styleSubtree");
      }
    });

    afterEach(() => {
      if (!shadyCSSApplied) {
        delete window.ShadyCSS;
      }
    });

    it("uses styleElement on first paint", () => {
      fragment.attachShadow({ mode: "open" });
      render(fragment, fragment.shadowRoot);
      expect(window.ShadyCSS.styleElement).toHaveBeenCalled();
      expect(window.ShadyCSS.styleSubtree).not.toHaveBeenCalled();
    });

    it("uses styleSubtree on sequential paint", () => {
      fragment.attachShadow({ mode: "open" });
      render(fragment, fragment.shadowRoot);
      render(fragment, fragment.shadowRoot);
      expect(window.ShadyCSS.styleSubtree).toHaveBeenCalled();
    });

    it("does not use ShadyCSS when shadowRoot is not used", () => {
      render(fragment, fragment);
      expect(window.ShadyCSS.styleElement).not.toHaveBeenCalled();
      expect(window.ShadyCSS.styleSubtree).not.toHaveBeenCalled();
    });
  });

  describe("use external element with shadowRoot", () => {
    class TestExternalElement extends HTMLElement {
      constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.innerHTML = `
          <div>test</div>
          <slot></slot>
        `;
      }
    }

    const render = value =>
      html`
        <test-external-element>${value}</test-external-element>
      `.define({ TestExternalElement });

    it("renders external element with slotted value", done => {
      const el = document.createElement("div");
      el.attachShadow({ mode: "open" });

      document.body.appendChild(el);

      render(0)(el, el.shadowRoot);

      setTimeout(() => {
        expect(el.shadowRoot.children[0].innerHTML).toBe("0");
        document.body.removeChild(el);
        done();
      }, 100);
    });
  });

  describe("svg element", () => {
    it("sets attribute from an expression", () => {
      const render = html`
        <svg viewBox="${"0 0 100 100"}"></svg>
      `;
      render({}, fragment);

      expect(fragment.children[0].getAttribute("viewBox")).toBe("0 0 100 100");
    });

    it("sets attribute from string with an expression", () => {
      const render = html`
        <svg viewBox="0 0 ${"100"} ${"100"}"></svg>
      `;
      render({}, fragment);

      expect(fragment.children[0].getAttribute("viewBox")).toBe("0 0 100 100");
    });
  });
});

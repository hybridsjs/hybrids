import { html } from "../../src/template/index.js";
import { resolveTimeout } from "../helpers.js";

describe("layout:", () => {
  let host;

  beforeEach(() => {
    host = document.createElement("div");
    document.body.appendChild(host);
  });

  afterEach(() => {
    document.body.removeChild(host);
  });

  it("throws for initializing with more than one root element", () => {
    expect(() =>
      html`
        <template layout="row"></template>
        <div></div>
      `(host),
    ).toThrow();
  });

  it("throws for unsupported rule", () => {
    expect(() => html`<template layout="test"></template>`(host)).toThrow();
  });

  it("throws for expressions inside the root element layout attribute", () => {
    expect(() => html`<template layout="${"row"}"></template>`(host)).toThrow();
  });

  it("throws for expressions inside the nested element layout attribute", () => {
    expect(() =>
      html`<template layout=""><div layout="${"row"}"></div></template>`(host),
    ).toThrow();
  });

  it("for target element turns on for root <template> element", () => {
    html`
      <template layout="row" class="test">
        ${html`<div layout="grow">test</div>`}
      </template>
    `(host);

    const hostStyles = window.getComputedStyle(host);
    expect(hostStyles.display).toBe("flex");
    expect(hostStyles.flexDirection).toBe("row");

    const elStyles = window.getComputedStyle(host.children[0]);
    expect(elStyles.flexGrow).toBe("1");
    expect(host.children[0].hasAttribute("layout")).toBe(false);
  });

  it("for shadowRoot turns on for root <template> element", () => {
    const shadowRoot = host.attachShadow({ mode: "open" });
    html`
      <template layout="row">
        <div></div>
      </template>
    `.css`
       :host { position: relative }
    `(host, shadowRoot);

    expect(host.className).not.toBeFalsy();

    const hostStyles = window.getComputedStyle(host);
    expect(hostStyles.position).toBe("relative");

    const nestedHost = shadowRoot.children[0];
    html`<template layout="row"><div></div></template>`(nestedHost);
    expect(nestedHost.className).not.toBeFalsy();
  });

  it("does not run without the template root element with 'layout*' attribute", () => {
    html`<div layout="row">test</div>`(host);

    const elStyles1 = window.getComputedStyle(host.children[0]);
    expect(elStyles1.display).toBe("block");
    expect(host.children[0].hasAttribute("layout")).toBe(true);

    html`<template><div layout="row">test</div></template>`(host);

    const elStyles2 = window.getComputedStyle(host.children[0]);
    expect(elStyles2.display).toBe("block");
    expect(host.children[0].hasAttribute("layout")).toBe(true);
  });

  it("uses layout engine for nested templates", () => {
    html`<template layout="row">${html`<div layout="row"></div>`}</template>`(
      host,
    );

    const nestedHost = host.children[0];
    const elStyles = window.getComputedStyle(nestedHost);
    expect(elStyles.display).toBe("flex");
    expect(elStyles.flexDirection).toBe("row");
    expect(nestedHost.hasAttribute("layout")).toBe(false);
  });

  it("uses layout engine for nested templates", () => {
    html`
      <template layout="row">${html`<div layout="column"></div>`}</template>
    `(host, host.attachShadow({ mode: "open" }));

    expect(host.shadowRoot.children[0].className).not.toBeFalsy();
  });

  it("uses layout engine for nested array templates", () => {
    html`<template layout="row">${[html`<div layout="row"></div>`]}</template>`(
      host,
    );

    const nestedHost = host.children[0];
    const elStyles = window.getComputedStyle(nestedHost);
    expect(elStyles.display).toBe("flex");
    expect(elStyles.flexDirection).toBe("row");
    expect(nestedHost.hasAttribute("layout")).toBe(false);
  });

  it("uses layout engine for html.resolve method", () => {
    html`<template layout="row"
      >${html.resolve(
        resolveTimeout(() => html`<div layout="row"></div>`, 200),
        html`<div layout="column"></div>`,
        0,
      )}</template
    >`(host);

    return resolveTimeout(() => {
      const el = host.children[0];
      const elStyles = window.getComputedStyle(el);
      expect(elStyles.display).toBe("flex");
      expect(elStyles.flexDirection).toBe("column");
      expect(el.hasAttribute("layout")).toBe(false);

      return resolveTimeout(() => {
        const el = host.children[0];
        const elStyles = window.getComputedStyle(el);
        expect(elStyles.display).toBe("flex");
        expect(elStyles.flexDirection).toBe("row");
        expect(el.hasAttribute("layout")).toBe(false);
      }, 200);
    }, 0);
  });

  it("replaces class for the host element", () => {
    html`<template layout="row"></template>`(host);
    const className = host.className;

    html`<template layout="column"></template>`(host);
    expect(host.className).not.toBe(className);
    expect(window.getComputedStyle(host).flexDirection).toBe("column");
  });

  it("set main element styles with zero specificity for content", () => {
    html`<template layout="row">
      <style>
        .layout-test-column {
          flex-flow: column;
        }
      </style>
    </template>`(host, host);

    host.className = `${host.className} layout-test-column`;
    expect(window.getComputedStyle(host).flexDirection).toBe("column");
  });

  it("set main element styles with zero specificity for shadowRoot", () => {
    const shadowRoot = host.attachShadow({ mode: "open" });
    html`<template layout="row">
      <div></div>
    </template>`.css`
      :host {
        flex-flow: column;
      }
    `(host, shadowRoot);

    expect(window.getComputedStyle(host).flexDirection).toBe("column");
  });

  it("keeps rules when element is taken out from the document", () => {
    const shadowRoot = host.attachShadow({ mode: "open" });
    html`<template layout="column"><div layout="row"></div></template>`(
      host,
      shadowRoot,
    );
    document.body.removeChild(host);

    return resolveTimeout(() => {
      document.body.appendChild(host);

      return resolveTimeout(() => {
        expect(window.getComputedStyle(host).display).toBe("flex");
      });
    });
  });

  it("not overwrite hidden selector for the host element", () => {
    const shadowRoot = host.attachShadow({ mode: "open" });
    html`<template layout="row"><div></div></template>`(host, shadowRoot);

    return resolveTimeout(() => {
      expect(window.getComputedStyle(host).display).toBe("flex");

      host.hidden = true;
      expect(window.getComputedStyle(host).display).toBe("none");
    });
  });

  it("supports multiline attribute value", () => {
    html`
      <template
        layout="
          row
          padding:2
        "
      >
      </template>
    `(host);

    const hostStyles = window.getComputedStyle(host);
    expect(hostStyles.display).toBe("flex");
    expect(hostStyles.flexDirection).toBe("row");
    expect(hostStyles.paddingTop).toBe("16px");
  });

  it("supports custom selectors", () => {
    html`<template layout="row" layout.active="column"></template>`(host);

    const hostStyles = window.getComputedStyle(host);
    expect(hostStyles.display).toBe("flex");
    expect(hostStyles.flexDirection).toBe("row");

    host.classList.add("active");
    expect(window.getComputedStyle(host).flexDirection).toBe("column");
  });

  it("supports predefined media queries", () => {
    html`
      <template layout="row" layout@200px="column">
        <div layout@200px="column"></div>
      </template>
    `(host);

    expect(window.getComputedStyle(host).flexDirection).toBe("column");
    expect(window.getComputedStyle(host.children[0]).flexDirection).toBe(
      "column",
    );
  });

  it("supports css variables", () => {
    html`<template layout="row margin:--sm"></template>`(host);
    document.documentElement.style.setProperty("--sm", "4px");

    expect(window.getComputedStyle(host).margin).toBe("4px");

    document.documentElement.style.removeProperty("--sm");
  });

  it("supports base rules", () => {
    html`
      <template layout>
        <span layout="block"></span>
        <div layout="block:center"></div>
        <div layout="inline"></div>
        <div layout="hidden"></div>
      </template>
    `(host);

    expect(window.getComputedStyle(host.children[0]).display).toBe("block");
    expect(window.getComputedStyle(host.children[1]).textAlign).toBe("center");
    expect(window.getComputedStyle(host.children[2]).display).toBe("inline");
    expect(window.getComputedStyle(host.children[3]).display).toBe("none");
  });

  it("supports flexbox rules", () => {
    html`
      <template layout="row gap">
        <div layout="grow shrink:2 order"></div>
        <div layout="shrink grow:2 order:2 basis"></div>
        <div layout="basis:200px"></div>
        <div><div layout="row:wrap inline gap::2"></div></div>
      </template>
    `(host);

    const hostStyles = window.getComputedStyle(host);
    expect(hostStyles.columnGap).toBe("8px");
    expect(hostStyles.rowGap).toBe("8px");

    const styles0 = window.getComputedStyle(host.children[0]);
    expect(styles0.flexGrow).toBe("1");
    expect(styles0.flexShrink).toBe("2");

    const styles1 = window.getComputedStyle(host.children[1]);
    expect(styles1.flexShrink).toBe("1");
    expect(styles1.flexGrow).toBe("2");
    expect(styles1.order).toBe("2");
    expect(styles1.flexBasis).toBe("auto");

    expect(window.getComputedStyle(host.children[2]).flexBasis).toBe("200px");

    const styles3 = window.getComputedStyle(host.children[3].children[0]);
    expect(styles3.flexWrap).toBe("wrap");
    expect(styles3.display).toBe("inline-flex");
    expect(styles3.rowGap).toBe("16px");
  });

  it("supports grid main rules", () => {
    html`
      <template layout="block">
        <div layout="grid"></div>
        <div layout="grid:2::column"></div>
        <div layout="grid:2:2:column:dense"></div>
        <div layout="grid::2"></div>
        <div layout="grid:100px|1"></div>
        <div layout="grid inline"></div>
      </template>
    `(host);

    const styles0 = window.getComputedStyle(host.children[0]);
    expect(styles0.gridTemplateColumns.split(" ").length).toBe(1);
    expect(styles0.gridTemplateRows).toBe("none");
    expect(styles0.gridAutoFlow).toBe("row");

    const styles1 = window.getComputedStyle(host.children[1]);
    expect(styles1.gridTemplateColumns.split(" ").length).toBe(2);
    expect(styles1.gridTemplateRows).toBe("none");
    expect(styles1.gridAutoFlow).toBe("column");

    const styles2 = window.getComputedStyle(host.children[2]);
    expect(styles2.gridTemplateColumns.split(" ").length).toBe(2);
    expect(styles2.gridTemplateRows.split(" ").length).toBe(2);
    expect(styles2.gridAutoFlow).toBe("column dense");

    const styles3 = window.getComputedStyle(host.children[3]);
    expect(styles3.gridTemplateColumns).toBe("none");
    expect(styles3.gridTemplateRows.split(" ").length).toBe(2);

    const styles4 = window.getComputedStyle(host.children[4]);
    const grid = styles4.gridTemplateColumns.split(" ");
    expect(grid[0]).toBe("100px");
    expect(grid[1]).not.toBeFalsy();

    const styles5 = window.getComputedStyle(host.children[5]);
    expect(styles5.display).toBe("inline-grid");
  });

  it("supports grid placement rules", () => {
    html`
      <template layout="grid:2:2">
        <div layout="area:2"></div>
        <div layout="area:2/3:1/3"></div>
        <div layout="area::1"></div>
        <div layout="area"></div>
      </template>
    `(host);

    const styles0 = window.getComputedStyle(host.children[0]);
    expect(styles0.gridColumnStart).toBe("span 2");

    const styles1 = window.getComputedStyle(host.children[1]);
    expect(styles1.gridColumnStart).toBe("2");
    expect(styles1.gridColumnEnd).toBe("3");
    expect(styles1.gridRowStart).toBe("1");
    expect(styles1.gridRowEnd).toBe("3");

    const styles2 = window.getComputedStyle(host.children[2]);
    expect(styles2.gridColumnStart).toBe("auto");
    expect(styles2.gridRowStart).toBe("span 1");

    const styles3 = window.getComputedStyle(host.children[3]);
    expect(styles3.gridColumnStart).toBe("auto");
    expect(styles3.gridRowStart).toBe("auto");
  });

  it("supports alignment rules", () => {
    html`
      <template layout>
        <div layout="grid items content self"></div>
        <div layout="grid items:end:start content:end self:end"></div>
      </template>
    `(host);

    const styles0 = window.getComputedStyle(host.children[0]);
    expect(styles0.alignItems).toBe("start");

    const styles1 = window.getComputedStyle(host.children[1]);
    expect(styles1.alignItems).toBe("end");
    expect(styles1.justifyItems).toBe("start");
    expect(styles1.justifyContent).toBe("end");
    expect(styles1.alignSelf).toBe("end");
  });

  it("supports sizing rules", () => {
    html`
      <template layout>
        <div layout="width:full"></div>
        <div layout="height:20px:10px:full padding"></div>
        <div layout="ratio:16/9"></div>
        <div layout="size:100px"></div>
        <div layout="size:100px:50px"></div>
        <div layout="size::50px"></div>
      </template>
    `(host);

    const styles0 = window.getComputedStyle(host.children[0]);
    expect(styles0.width).not.toBe("0px");

    const styles1 = window.getComputedStyle(host.children[1]);
    expect(styles1.height).toBe("20px");
    expect(styles1.minHeight).toBe("10px");
    expect(styles1.maxHeight).toBe("100%");

    const styles2 = window.getComputedStyle(host.children[2]);
    expect(styles2.aspectRatio).toBe("16 / 9");

    const styles3 = window.getComputedStyle(host.children[3]);
    expect(styles3.width).toBe("100px");

    const styles4 = window.getComputedStyle(host.children[4]);
    expect(styles4.width).toBe("100px");
    expect(styles4.height).toBe("50px");

    const styles5 = window.getComputedStyle(host.children[5]);
    expect(styles5.width).not.toBe("50px");
    expect(styles5.height).toBe("50px");
  });

  it("supports overscroll and overflow rules", () => {
    html`
      <template layout>
        <div layout="overflow:auto"></div>
        <div layout="overflow:x:scroll"></div>
        <div layout="overflow:hidden"></div>
        <div layout="overflow"></div>
      </template>
    `(host);

    const styles0 = window.getComputedStyle(host.children[0]);
    expect(styles0.overflow).toBe("auto");

    const styles1 = window.getComputedStyle(host.children[1]);
    expect(styles1.overflowX).toBe("scroll");
    expect(styles1.overflowY).toBe("auto");

    const styles2 = window.getComputedStyle(host.children[2]);
    expect(styles2.overflow).toBe("hidden");

    const styles3 = window.getComputedStyle(host.children[3]);
    expect(styles3.overflow).toBe("hidden");
  });

  it("supports margin rules", () => {
    html`
      <template layout>
        <div layout="margin"></div>
        <div layout="margin:top:2"></div>
        <div layout="margin:2:4"></div>
        <div layout="margin:bottom"></div>
        <div layout="margin:-2"></div>
      </template>
    `(host);

    const styles0 = window.getComputedStyle(host.children[0]);
    expect(styles0.marginTop).toBe("8px");
    expect(styles0.marginRight).toBe("8px");
    expect(styles0.marginBottom).toBe("8px");
    expect(styles0.marginLeft).toBe("8px");

    const styles1 = window.getComputedStyle(host.children[1]);
    expect(styles1.marginTop).toBe("16px");
    expect(styles1.marginRight).toBe("0px");

    const styles2 = window.getComputedStyle(host.children[2]);
    expect(styles2.marginTop).toBe("16px");
    expect(styles2.marginRight).toBe("32px");

    const styles3 = window.getComputedStyle(host.children[3]);
    expect(styles3.marginBottom).toBe("8px");

    const styles4 = window.getComputedStyle(host.children[4]);
    expect(styles4.marginTop).toBe("-16px");
  });

  it("supports padding rules", () => {
    html`
      <template layout>
        <div layout="padding"></div>
        <div layout="padding:top:2"></div>
        <div layout="padding:2:4"></div>
        <div layout="padding:bottom"></div>
        <div layout="padding:-2"></div>
      </template>
    `(host);

    const styles0 = window.getComputedStyle(host.children[0]);
    expect(styles0.paddingTop).toBe("8px");
    expect(styles0.paddingRight).toBe("8px");
    expect(styles0.paddingBottom).toBe("8px");
    expect(styles0.paddingLeft).toBe("8px");

    const styles1 = window.getComputedStyle(host.children[1]);
    expect(styles1.paddingTop).toBe("16px");
    expect(styles1.paddingRight).toBe("0px");

    const styles2 = window.getComputedStyle(host.children[2]);
    expect(styles2.paddingTop).toBe("16px");
    expect(styles2.paddingRight).toBe("32px");

    const styles3 = window.getComputedStyle(host.children[3]);
    expect(styles3.paddingBottom).toBe("8px");

    const styles4 = window.getComputedStyle(host.children[4]);
    expect(styles4.paddingTop).toBe("0px");
  });

  it("supports position rules", () => {
    html`
      <template layout>
        <div layout="inset layer"></div>
        <div layout="top left bottom right layer:2"></div>
        <div layout="top:2 left:2 bottom:2 right:2"></div>
        <div layout="inset:2"></div>
      </template>
    `(host);

    const styles0 = window.getComputedStyle(host.children[0]);
    expect(styles0.top).toBe("0px");
    expect(styles0.right).toBe("0px");
    expect(styles0.bottom).toBe("0px");
    expect(styles0.left).toBe("0px");
    expect(styles0.zIndex).toBe("1");

    const styles1 = window.getComputedStyle(host.children[1]);
    expect(styles1.top).toBe("0px");
    expect(styles1.right).toBe("0px");
    expect(styles1.bottom).toBe("0px");
    expect(styles1.left).toBe("0px");
    expect(styles1.zIndex).toBe("2");

    const styles2 = window.getComputedStyle(host.children[2]);
    expect(styles2.top).toBe("16px");
    expect(styles2.right).toBe("16px");
    expect(styles2.bottom).toBe("16px");
    expect(styles2.left).toBe("16px");

    const styles3 = window.getComputedStyle(host.children[3]);
    expect(styles3.top).toBe("16px");
    expect(styles3.right).toBe("16px");
    expect(styles3.bottom).toBe("16px");
    expect(styles3.left).toBe("16px");
  });

  it("supports generic variables as properties with values", () => {
    expect(() => {
      html`
        <template layout>
          <div layout="::border"></div>
        </template>
      `(host);
    }).toThrow();

    html`
      <template layout>
        <div layout="::ui:color:red ::border:thin"></div>
        <div layout="::font:headline-m"></div>
      </template>
    `.css`
      :host {
        --ui-color-red: red;
        --border-thin: 1px solid black;
        --font-headline-m: 24px sans-serif;
      }
    `(host);

    const styles0 = window.getComputedStyle(host.shadowRoot.children[0]);
    expect(styles0.color).toBe("rgb(255, 0, 0)");
    expect(styles0.border).toBe("1px solid rgb(0, 0, 0)");

    const styles1 = window.getComputedStyle(host.shadowRoot.children[1]);
    expect(styles1.font).toBe("24px sans-serif");
  });

  if (document.startViewTransition) {
    it("supports transition view name", () => {
      html`
        <template layout>
          <div layout="view:test"></div>
        </template>
      `(host);

      const styles0 = window.getComputedStyle(host.children[0]);
      expect(styles0.viewTransitionName).toBe("test");
    });
  }
});

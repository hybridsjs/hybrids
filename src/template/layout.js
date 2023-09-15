const hasAdoptedStylesheets = !!(
  globalThis.document && globalThis.document.adoptedStyleSheets
);
const NUMBER_REGEXP = /^\d+$/;
const rules = {
  // base
  block: (props, align) => ({
    display: "block",
    "text-align": align,
  }),
  inline: ({ display }) => ({
    display: `inline${display ? `-${display}` : ""}`,
  }),
  contents: { display: "contents" },
  hidden: { display: "none" },

  // flexbox
  ...["row", "row-reverse", "column", "column-reverse"].reduce((acc, type) => {
    acc[type] = (props, wrap = "nowrap") => ({
      display: "flex",
      "flex-flow": `${type} ${wrap}`,
    });
    return acc;
  }, {}),
  grow: (props, value = 1) => ({ "flex-grow": value }),
  shrink: (props, value = 1) => ({ "flex-shrink": value }),
  basis: (props, value) => ({ "flex-basis": dimension(value) }),
  order: (props, value = 0) => ({ order: value }),

  // grid
  grid: (props, columns = "1", rows = "", autoFlow = "", dense = "") => ({
    display: "grid",
    ...["columns", "rows"].reduce((acc, type) => {
      const value = type === "columns" ? columns : rows;
      acc[`grid-template-${type}`] =
        value &&
        value
          .split("|")
          .map((v) =>
            v.match(NUMBER_REGEXP)
              ? `repeat(${v}, minmax(0, 1fr))`
              : dimension(v),
          )
          .join(" ");
      return acc;
    }, {}),
    "grid-auto-flow": `${autoFlow} ${dense && "dense"}`,
  }),
  area: (props, column = "", row = "") => ({
    "grid-column": column.match(NUMBER_REGEXP) ? `span ${column}` : column,
    "grid-row": row.match(NUMBER_REGEXP) ? `span ${row}` : row,
  }),
  gap: (props, column = 1, row = "") => ({
    "column-gap": dimension(column),
    "row-gap": dimension(row || column),
  }),

  // alignment
  items: (props, v1 = "start", v2 = "") => ({
    "place-items": `${v1} ${v2}`,
  }),
  content: (props, v1 = "start", v2 = "") => ({
    "place-content": `${v1} ${v2}`,
  }),
  self: (props, v1 = "start", v2 = "") => ({
    "place-self": `${v1} ${v2}`,
  }),
  center: { "place-items": "center", "place-content": "center" },

  // size
  size: (props, width, height = width) => ({
    width: dimension(width),
    height: dimension(height),
    "box-sizing": "border-box",
  }),
  width: (props, base, min, max) => ({
    width: dimension(base),
    "min-width": dimension(min),
    "max-width": dimension(max),
    "box-sizing": "border-box",
  }),
  height: (props, base, min, max) => ({
    height: dimension(base),
    "min-height": dimension(min),
    "max-height": dimension(max),
    "box-sizing": "border-box",
  }),
  ratio: (props, v1) => ({ "aspect-ratio": v1 }),
  overflow: (props, v1 = "hidden", v2 = "") => {
    const type = v2 ? `-${v1}` : "";
    const value = v2 ? v2 : v1;

    return {
      [`overflow${type}`]: value,
      ...(value === "scroll"
        ? {
            "flex-grow": props["flex-grow"] || 1,
            "flex-basis": 0,
            "overscroll-behavior": "contain",
            "--webkit-overflow-scrolling": "touch",
          }
        : {}),
    };
  },
  margin: (props, v1 = "1", v2, v3, v4) => {
    if (v1.match(/top|bottom|left|right/)) {
      return {
        [`margin-${v1}`]: dimension(v2 || "1"),
      };
    }

    return {
      margin: `${dimension(v1)} ${dimension(v2)} ${dimension(v3)} ${dimension(
        v4,
      )}`,
    };
  },
  padding: (props, v1 = "1", v2, v3, v4) => {
    if (v1.match(/top|bottom|left|right/)) {
      return {
        [`padding-${v1}`]: dimension(v2 || "1"),
      };
    }

    return {
      padding: `${dimension(v1)} ${dimension(v2)} ${dimension(v3)} ${dimension(
        v4,
      )}`,
    };
  },

  // position types
  absolute: { position: "absolute" },
  relative: { position: "relative" },
  fixed: { position: "fixed" },
  sticky: { position: "sticky" },
  static: { position: "static" },

  // position values
  inset: (props, value = 0) => {
    const d = dimension(value);
    return { top: d, right: d, bottom: d, left: d };
  },
  top: (props, value = 0) => ({ top: dimension(value) }),
  bottom: (props, value = 0) => ({ bottom: dimension(value) }),
  left: (props, value = 0) => ({ left: dimension(value) }),
  right: (props, value = 0) => ({ right: dimension(value) }),

  layer: (props, value = 1) => ({ "z-index": value }),

  "": (props, _, ...args) => {
    if (args.length < 2) {
      throw new Error(
        "Generic rule '::' requires at least two arguments, eg.: ::[property]:[name]",
      );
    }

    return {
      [args[args.length - 2]]: `var(--${args.join("-")})`,
    };
  },
  view: (props, value) => ({ "view-transition-name": value }),
};

const dimensions = {
  min: "min-content",
  max: "max-content",
  fit: "fit-content",
  full: "100%",
};

const queries = {
  portrait: "orientation: portrait",
  landscape: "orientation: landscape",
};

function dimension(value) {
  value = dimensions[value] || value;

  if (/^-?\d+(\.\d+)*$/.test(String(value))) {
    return `${value * 8}px`;
  }

  return value || "";
}

let globalSheet;
function getCSSStyleSheet() {
  if (globalSheet) return globalSheet;

  /* istanbul ignore else */
  if (hasAdoptedStylesheets) {
    globalSheet = new globalThis.CSSStyleSheet();
  } else {
    const el = globalThis.document.createElement("style");
    el.appendChild(globalThis.document.createTextNode(""));
    globalThis.document.head.appendChild(el);

    globalSheet = el.sheet;
  }

  globalSheet.insertRule(":host([hidden]) { display: none; }");

  return globalSheet;
}

const styleElements = new WeakMap();
let injectedTargets = new WeakSet();

export function inject(target) {
  const root = target.getRootNode();
  if (injectedTargets.has(root)) return;

  const sheet = getCSSStyleSheet();

  /* istanbul ignore else */
  if (hasAdoptedStylesheets) {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
  } else {
    if (root === globalThis.document) return;

    let el = styleElements.get(root);
    if (!el) {
      el = globalThis.document.createElement("style");
      root.appendChild(el);

      styleElements.set(root, el);
    }

    let result = "";
    for (let i = 0; i < sheet.cssRules.length; i++) {
      result += sheet.cssRules[i].cssText;
    }

    el.textContent = result;
  }

  injectedTargets.add(root);
}

const classNames = new Map();
export function insertRule(node, query, tokens, hostMode) {
  let className = classNames.get(node);
  if (!className) {
    className = `l-${Math.random().toString(36).substr(2, 5)}`;
    classNames.set(node, className);
  }

  /* istanbul ignore next */
  if (!hasAdoptedStylesheets) injectedTargets = new WeakSet();

  const sheet = getCSSStyleSheet();
  const [selectors, mediaQueries = ""] = query.split("@");

  const cssRules = Object.entries(
    tokens
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .reduce((acc, token) => {
        const [id, ...args] = token.split(":");
        const rule = rules[id];

        if (!rule) {
          throw TypeError(`Unsupported layout rule: '${id}'`);
        }

        return Object.assign(
          acc,
          typeof rule === "function"
            ? rule(acc, ...args.map((v) => (v.match(/--.*/) ? `var(${v})` : v)))
            : rule,
        );
      }, {}),
  ).reduce(
    (acc, [key, value]) =>
      value !== undefined && value !== "" ? acc + `${key}: ${value};` : acc,
    "",
  );

  const mediaSelector = mediaQueries.split(":").reduce((acc, query) => {
    if (query === "") return acc;
    return acc + ` and (${queries[query] || `min-width: ${query}`})`;
  }, "@media screen");

  if (hostMode) {
    const shadowSelector = `:host(:where(.${className}-s${selectors}))`;
    const contentSelector = `:where(.${className}-c${selectors})`;

    [shadowSelector, contentSelector].forEach((selector) => {
      sheet.insertRule(
        mediaQueries
          ? `${mediaSelector} { ${selector} { ${cssRules} } }`
          : `${selector} { ${cssRules} }`,
        sheet.cssRules.length - 1,
      );
    });
  } else {
    const selector = `.${className}${selectors}`;

    sheet.insertRule(
      mediaQueries
        ? `${mediaSelector} { ${selector} { ${cssRules} } }`
        : `${selector} { ${cssRules} }`,
      sheet.cssRules.length - 1,
    );
  }

  return className;
}

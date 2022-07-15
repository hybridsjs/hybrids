import sax from "./sax.js";

function indexStartWith(content, index, target) {
  for (let i = 0; i < target.length; i++) {
    if (content[index + i] !== target[i]) {
      return false;
    }
  }
  return true;
}

function moveIndex(content, i, start, end, escape = true) {
  if (indexStartWith(content, i, start)) {
    i += 1;
    while (
      (i < content.length && !indexStartWith(content, i, end)) ||
      (escape && content[i - 1] === "\\")
    ) {
      i++;
    }

    return i + end.length;
  }

  return i;
}

function skip(content, i) {
  // strings
  i = moveIndex(content, i, "'", "'", false);
  i = moveIndex(content, i, '"', '"', true);

  // comments
  i = moveIndex(content, i, "//", "\n", false);
  i = moveIndex(content, i, "/*", "*/", false);

  // regexp
  i = moveIndex(content, i, "/", "/", true);

  return i;
}

const REGEXP_ONLY_EXPRESSIONS = /^[^A-Za-z]+$/;
const REGEXP_WHITESPACE = /^\s*$/;
const DISABLED_TAGS = ["script", "style"];

function clean(text) {
  return text && text.trim().replace(/\s+/g, " ");
}

function getMessages(template, strict) {
  if (strict) {
    const [key, description, context] = template.split("|");
    return [
      {
        key: `${clean(key)}${context ? ` | ${context}` : ""}`,
        message: clean(key),
        description: description && clean(description),
      },
    ];
  }

  const parser = sax.parser(false, { lowercase: true });
  const tree = { children: [] };
  const keys = [];
  let currentTag = tree;
  let noTranslate = null;

  parser.oncomment = function (text) {
    currentTag.children.push({ type: "comment", text });
  };

  parser.ontext = function (text) {
    if (!noTranslate) {
      if (
        !text.match(REGEXP_WHITESPACE) &&
        !text.match(REGEXP_ONLY_EXPRESSIONS)
      ) {
        const prevChild = currentTag.children[currentTag.children.length - 1];
        let offset = 0;
        let key = clean(text).replace(/\${(\d+)}/g, () => `\${${offset++}}`);
        const m = {
          key,
          message: key,
        };

        if (prevChild && prevChild.type === "comment") {
          const [description, context] = prevChild.text.split("|");
          m.key = `${m.key}${context ? ` | ${clean(context)}` : ""}`;
          if (description.trim()) {
            m.description = clean(description);
          }
        }

        keys.push(m);
      }
    }

    currentTag.children.push({ type: "text", text });
  };

  parser.onopentag = function (tag) {
    currentTag.children.push(tag);
    tag.parent = currentTag;
    tag.children = [];
    tag.type = "tag";

    if (tag.attributes.translate === "no" || DISABLED_TAGS.includes(tag.name)) {
      noTranslate = tag;
    }

    if (!tag.isSelfClosing) {
      currentTag = tag;
    }
  };

  parser.onclosetag = function (tag) {
    if (currentTag.name === tag) {
      if (noTranslate == currentTag) {
        noTranslate = null;
      }
      currentTag = currentTag.parent;
    }
  };

  parser.write(`<div>${template}</div>`).close();

  return keys;
}

function extractKeys(content, i = 0) {
  const nested = i !== 0;
  const keys = [];

  let temp;
  let strContext;
  let strict;
  let exprIndex = 0;
  let bracketStack = Number(nested);

  for (; i < content.length; i++) {
    if (temp !== undefined) {
      if (indexStartWith(content, i, "${") && content[i - 1] !== "\\") {
        temp += `\${${exprIndex++}`;
        const result = extractKeys(content, i + 2);
        keys.push(...result.keys);
        i = result.i;
        temp += content[i];
      } else if (indexStartWith(content, i, "`") && content[i - 1] !== "\\") {
        if (strContext) {
          strContext = false;
        } else {
          keys.push(...getMessages(temp, strict));
        }
        strict = false;
        temp = undefined;
      } else {
        temp += content[i];
      }
    } else {
      i = skip(content, i);

      if (indexStartWith(content, i, "`") && content[i - 1] !== "\\") {
        temp = "";
        strContext = true;
      } else if (indexStartWith(content, i, "msg`")) {
        i += 3;
        temp = "";
        strict = true;
      } else if (indexStartWith(content, i, "msg.html`")) {
        i += 8;
        temp = "";
        strict = true;
      } else if (indexStartWith(content, i, "msg.svg`")) {
        i += 7;
        temp = "";
        strict = true;
      } else if (indexStartWith(content, i, "html`")) {
        i += 4;
        temp = "";
      } else if (indexStartWith(content, i, "{")) {
        bracketStack += 1;
      } else if (indexStartWith(content, i, "}")) {
        bracketStack -= 1;
        if (bracketStack === 0 && nested) {
          return { keys, i };
        }
      }
    }
  }

  return nested ? { keys, i } : keys;
}

function getChromeI18nFormat(entry) {
  return {
    key: entry.key
      .replace("$", "@")
      .replace(/[^a-zA-Z0-9_@]/g, "_")
      .toLowerCase(),
    message: entry.message.replace(/\$/g, "$$$"),
    description: entry.description,
  };
}

export default function extract(content, format = "") {
  const keys = extractKeys(content);
  switch (format) {
    case "chrome.i18n":
      return keys.map(getChromeI18nFormat);
    default:
      return keys;
  }
}

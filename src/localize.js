import { compileTemplate } from "./template/core.js";
import { getPlaceholder } from "./template/utils.js";

import global from "./global.js";
import { probablyDevMode } from "./utils.js";

const dictionary = new Map();
const cache = new Map();
let translate = null;

const languages = (() => {
  // istanbul ignore next
  return (
    global.navigator
      ? global.navigator.languages || [global.navigator.language]
      : []
  ).reduce((set, code) => {
    const codeWithoutRegion = code.split("-")[0];
    set.add(code);
    if (code !== codeWithoutRegion) set.add(codeWithoutRegion);
    return set;
  }, new Set());
})();

export function clear() {
  languages.delete("default");
  dictionary.clear();
  cache.clear();

  translate = null;
}

const pluralRules = new Map();
export function get(key, context, args = []) {
  key = key.trim();
  context = context.trim();

  const cacheKey = `${key} | ${context}`;
  let msg = cache.get(cacheKey);

  if (!msg) {
    if (dictionary.size) {
      for (const lang of languages) {
        const msgs = dictionary.get(lang);
        if (msgs) {
          msg = msgs[cacheKey] || msgs[key];

          if (msg) {
            msg = msg.message;

            if (typeof msg === "object") {
              let rules = pluralRules.get(lang);
              if (!rules) {
                rules = new Intl.PluralRules(lang);
                pluralRules.set(lang, rules);
              }

              const pluralForms = msg;
              msg = (number) =>
                (number === 0 && pluralForms.zero) ||
                pluralForms[rules.select(number)] ||
                pluralForms.other ||
                "";
            }
            break;
          }
        }
      }
    }

    if (!msg) {
      if (translate) {
        msg = translate(key, context);
      } else {
        msg = key;
        if (dictionary.size && probablyDevMode) {
          console.warn(
            `Missing translation: "${key}"${context ? ` [${context}]` : ""}`,
          );
        }
      }
    }

    cache.set(cacheKey, msg);
  }

  return typeof msg === "function" ? msg(args[0]) : msg;
}

export function localize(lang, messages) {
  switch (typeof lang) {
    case "function":
      translate = lang;
      break;
    case "string": {
      if (!messages || typeof messages !== "object") {
        throw TypeError("Messages must be an object");
      }

      if (lang === "default") {
        languages.add("default");
      }

      const current = dictionary.get(lang) || {};
      dictionary.set(lang, { ...current, ...messages });
      break;
    }
    default:
      throw TypeError("The first argument must be a string or a function");
  }
}

Object.defineProperty(localize, "languages", {
  get: () => Array.from(languages),
});

function getString(parts, args) {
  const string = parts.reduce(
    (acc, part, index) => `${acc}\${${index - 1}}${part}`,
  );
  const [key, , context = ""] = string.split("|");

  return get(key, context, args);
}

const EXP_REGEX = /\$\{(\d+)\}/g;
const SVG_PLACEHOLDER = getPlaceholder("svg");

export function msg(parts, ...args) {
  return getString(parts, args).replace(EXP_REGEX, (_, index) => args[index]);
}

const templates = new Map();

msg.html = function html(parts, ...args) {
  const input = getString(parts, args);

  return (host, target = host) => {
    let render = templates.get(input);
    if (!render) {
      render = compileTemplate(input.split(EXP_REGEX), false, false, false);
      templates.set(input, render);
    }

    render(host, target, args);
  };
};

msg.svg = function svg(parts, ...args) {
  const input = getString(parts, args);

  return (host, target = host) => {
    const id = input + SVG_PLACEHOLDER;
    let render = templates.get(id);
    if (!render) {
      render = compileTemplate(input.split(EXP_REGEX), true, false, false);
      templates.set(id, render);
    }

    render(host, target, args);
  };
};

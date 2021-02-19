import { defineElement, callbacksMap } from "./define.js";
import * as cache from "./cache.js";
import { dispatch, pascalToDash } from "./utils.js";

/*

# TODO LIST

* Guarded routes:
  - guardUrl() helper

* Move scroll restoration to connected callback of the view
* Nested routers
* is active route helper
* Focus
* Transition effect

*/

const connect = Symbol("router.connect");
const configs = new WeakMap();

const placeholder = Date.now();
function setupBrowserUrl(browserUrl) {
  if (!browserUrl) return null;

  const [pathname, search = ""] = browserUrl.split("?");

  const searchParams = search ? search.split(",") : [];
  const pathnameParams = [];
  const normalizedPathname = pathname.replace(/:([^/]+)/g, (_, key) => {
    if (searchParams.includes(key)) {
      throw TypeError(`The '${key}' property already set in search parameters`);
    }
    pathnameParams.push(key);
    return placeholder;
  });

  const parts = normalizedPathname.substr(1).split(placeholder);

  return {
    browserUrl,
    paramsKeys: [...searchParams, ...pathnameParams],
    url(params, suppressErrors) {
      let temp = normalizedPathname;

      if (pathnameParams.length) {
        temp = temp.split(placeholder).reduce((acc, part, index) => {
          if (index === 0) return part;
          const key = pathnameParams[index - 1];

          if (!hasOwnProperty.call(params, key) && !suppressErrors) {
            throw Error(`The '${key}' parameter must be defined`);
          }

          return `${acc}${params[key]}${part}`;
        });
      }

      const url = new URL(temp, window.location.origin);

      if (suppressErrors) {
        searchParams.forEach(key => {
          url.searchParams.append(key, String(params[key]));
        });
      } else {
        Object.keys(params).forEach(key => {
          if (pathnameParams.includes(key)) return;

          if (searchParams.includes(key)) {
            url.searchParams.append(key, params[key]);
          } else {
            throw TypeError(`The '${key}' parameter is not supported`);
          }
        });
      }

      return url;
    },
    match(url) {
      const params = {};
      let temp = url.pathname;

      if (pathnameParams.length) {
        for (let i = 0; i < parts.length; i += 1) {
          if (temp === parts[i]) break;
          if (!temp.length || temp[0] !== "/") return null;

          temp = temp.substr(1);

          if (temp.substr(0, parts[i].length) !== parts[i]) return null;
          temp = temp
            .substr(parts[i].length)
            .replace(/^([^/]+)/, (_, value) => {
              params[pathnameParams[i]] = value;
              return "";
            });
        }
      } else if (temp !== pathname) {
        return null;
      }

      url.searchParams.forEach((value, key) => {
        if (searchParams.includes(key)) params[key] = value;
      });

      return params;
    },
  };
}

function hasInStack(config, target) {
  return config.stack.some(temp => {
    if (temp === target) return true;
    return hasInStack(temp, target);
  });
}

function setupViews(views, parent = null) {
  if (typeof views === "function") views = views();

  const result = Object.entries(views).map(([name, view]) => {
    // eslint-disable-next-line no-use-before-define
    const config = setupView(name, view, parent);

    if (parent && hasInStack(config, parent)) {
      throw Error(
        `${parent.name} cannot be in the stack of ${config.name} - ${config.name} already connected to ${parent.name}`,
      );
    }

    return config;
  });

  return result;
}

function setupView(name, view, parent) {
  const id = pascalToDash(`${name}-view`);

  if (!view || typeof view !== "object") {
    throw TypeError(
      `${name} in the stack of ${
        parent.name
      } must be an object instance: ${typeof view} - for import/export cycle, wrap stack option in a function`,
    );
  }

  let config = configs.get(view);

  if (config && config.name !== name) {
    throw Error(
      `View definition for ${name} in ${parent.name} already connected to the router as ${config.name}`,
    );
  }

  if (!config) {
    let browserUrl = null;

    const options = {
      dialog: false,
      guard: false,
      multiple: false,
      ...view[connect],
    };
    const Constructor = defineElement(id, view);
    const writableParams = new Set();

    Object.keys(Constructor.prototype).forEach(key => {
      const desc = Object.getOwnPropertyDescriptor(Constructor.prototype, key);
      if (desc.set) writableParams.add(key);
    });

    if (options.url) {
      if (options.dialog) {
        throw Error(
          `The 'url' option is not supported for dialogs - remove it from ${name}`,
        );
      }
      if (typeof options.url !== "string") {
        throw TypeError(
          `The 'url' option in ${name} must be a string: ${typeof options.url}`,
        );
      }
      browserUrl = setupBrowserUrl(options.url);

      callbacksMap.get(Constructor).unshift(_ =>
        cache.observe(
          _,
          connect,
          host => browserUrl.url(host, true),
          (host, url) => {
            const state = window.history.state;
            const entry = state[0];

            if (entry.id === configs.get(host).id) {
              entry.params = browserUrl.paramsKeys.reduce((acc, key) => {
                acc[key] = String(host[key]);
                return acc;
              }, {});

              window.history.replaceState(state, "", url);
            }
          },
        ),
      );

      browserUrl.paramsKeys.forEach(key => {
        const desc = Object.getOwnPropertyDescriptor(
          Constructor.prototype,
          key,
        );
        if (!desc || !desc.set) {
          throw Error(
            `'${key}' parameter in the url is not supported by the ${name}`,
          );
        }
      });
    }

    let guard;
    if (options.guard) {
      const el = new Constructor();
      guard = () => {
        try {
          return options.guard(el);
        } catch (e) {
          console.error(e);
          return false;
        }
      };
    }

    config = {
      id,
      name,
      view,
      options,
      guard,
      parent: undefined,
      parentsWithGuards: undefined,
      stack: [],
      ...(browserUrl || {
        url(params) {
          const url = new URL(`@${id}`, window.location.origin);

          Object.keys(params).forEach(key => {
            if (writableParams.has(key)) {
              url.searchParams.append(key, params[key]);
            } else {
              throw TypeError(`The '${key}' parameter is not supported`);
            }
          });

          return url;
        },
        match(url) {
          const params = {};
          url.searchParams.forEach((value, key) => {
            if (writableParams.has(key)) params[key] = value;
          });

          return params;
        },
      }),
      create() {
        const el = new Constructor();
        configs.set(el, config);

        return el;
      },
      getEntry(params) {
        const entry = { id, params, dialog: options.dialog };
        const guardConfig = config.parentsWithGuards.find(c => !c.guard());

        if (guardConfig) {
          return {
            id: guardConfig.id,
            params,
            dialog: options.dialog,
            from: entry,
          };
        }

        if (config.guard && config.guard()) {
          return { ...config.stack[0].getEntry(params) };
        }

        return entry;
      },
    };

    configs.set(view, config);
    configs.set(Constructor, config);

    if (options.stack) {
      if (options.dialog) {
        throw Error(
          `The 'stack' option is not supported for dialogs - remove it from ${name}`,
        );
      }
      config.stack = setupViews(options.stack, config);
    }
  }

  return config;
}

function getConfigById(id) {
  const Constructor = customElements.get(id);
  return configs.get(Constructor);
}

function getUrl(view, params = {}) {
  const config = configs.get(view);
  if (!config) {
    throw Error(`Provided view is not connected to the router instance`);
  }

  return config.url(params);
}

function getBackUrl(params = {}) {
  const state = window.history.state;
  let config;

  if (state.length > 1) {
    const prevEntry = state[1];
    config = getConfigById(prevEntry.id);

    if (!config.guard) {
      return config.url({ ...prevEntry.params, ...params });
    }
  } else {
    const currentConfig = getConfigById(state[0].id);
    if (currentConfig.parent) {
      config = currentConfig.parent;
    }
  }

  if (config) {
    if (config.guard) {
      config = config.parent;
      while (config && config.guard) {
        config = config.parent;
      }
    }

    if (config) {
      return config.url(params);
    }
  }

  return "";
}

function getCurrentUrl(params = {}) {
  const state = window.history.state;

  if (state.length) {
    const entry = state[0];
    const config = getConfigById(entry.id);
    return config.url({ ...entry.params, ...params });
  }

  return "";
}

function handleNavigate(event) {
  if (event.defaultPrevented) return;

  let url;

  switch (event.type) {
    case "click": {
      if (event.ctrlKey || event.metaKey) return;
      const anchorEl = event
        .composedPath()
        .find(el => el instanceof HTMLAnchorElement);

      if (anchorEl) {
        url = new URL(anchorEl.href, window.location.origin);
      }
      break;
    }
    case "submit": {
      if (event.target.action) {
        url = new URL(event.target.action, window.location.origin);
      }
      break;
    }
    default:
      return;
  }

  if (url && url.origin === window.location.origin) {
    dispatch(event.target, "navigate", {
      detail: { url, event },
      bubbles: true,
      composed: true,
    });
  }
}

let activePromise;
function resolveEvent(event, promise) {
  event.preventDefault();
  activePromise = promise;

  const path = event.composedPath();
  const pseudoEvent = {
    type: event.type,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    target: event.target,
    defaultPrevented: false,
    preventDefault: () => {},
    composedPath: () => path,
  };

  promise.then(() => {
    if (promise === activePromise) {
      requestAnimationFrame(() => {
        handleNavigate(pseudoEvent);
      });
      activePromise = null;
    }
  });
}

function mapDeepElements(target, cb) {
  cb(target);

  const walker = document.createTreeWalker(
    target,
    NodeFilter.SHOW_ELEMENT,
    null,
    false,
  );

  while (walker.nextNode()) {
    const el = walker.currentNode;
    cb(el);
    if (el.shadowRoot) {
      mapDeepElements(el.shadowRoot, cb);
    }
  }
}

const scrollMap = new WeakMap();
function saveScrollPositions(target) {
  const map = new Map();
  map.set(window, { x: window.scrollX, y: window.scrollY });

  mapDeepElements(target, el => {
    if (el.scrollHeight > el.clientHeight || el.scrollLeft > el.clientLeft) {
      map.set(el, { x: el.scrollLeft, y: el.scrollTop });
    }
  });

  scrollMap.set(target, map);
}

function restoreScrollPositions(target, clear) {
  const map = scrollMap.get(target);
  if (map) {
    map.forEach(
      clear
        ? (_, el) => el.scrollTo(0, 0)
        : ({ x, y }, el) => el.scrollTo(x, y),
    );
    scrollMap.delete(target);
  }
}

function deepEach(stack, cb, parent, set = new WeakSet()) {
  stack
    .filter(c => {
      if (set.has(c)) return false;

      set.add(c);
      cb(c, parent);

      return c.stack.length;
    })
    .forEach(c => {
      deepEach(c.stack, cb, c, set);
    });
}

function router(views, options = {}) {
  options = { url: "/", ...options };

  const roots = setupViews(views);
  const entryPoints = [];

  deepEach(roots, (c, parent) => {
    c.parent = parent;

    let tempParent = parent;
    c.parentsWithGuards = [];
    while (tempParent) {
      if (tempParent.guard) c.parentsWithGuards.unshift(tempParent);
      tempParent = tempParent.parent;
    }

    if (c.browserUrl) entryPoints.push(c);
  });

  let stack = [];

  return {
    get: () =>
      stack
        .slice(0, window.history.state.findIndex(entry => !entry.dialog) + 1)
        .reverse(),

    connect(host, key, invalidate) {
      function flush() {
        const state = window.history.state;
        const offset = stack.length - state.length;

        stack = state.map(({ id }, index) => {
          const prevView = stack[index + offset];
          const config = getConfigById(id);
          let nextView;

          if (prevView) {
            const prevConfig = configs.get(prevView);
            if (config.id !== prevConfig.id) {
              return config.create();
            }
            nextView = prevView;
          } else {
            nextView = config.create();
          }

          if (index !== 0) {
            cache.suspend(nextView);
          } else if (nextView === prevView) {
            cache.unsuspend(nextView);
          }

          return nextView;
        });

        Object.assign(stack[0], state[0].params);
        invalidate();
      }

      function navigateBack(offset, entry, nextUrl) {
        const stateLength = window.history.state.length;
        const pushOffset = offset < stateLength - 1 && stateLength > 2 ? 1 : 0;

        offset = -(offset + pushOffset);

        const replace = popStateEvent => {
          if (popStateEvent) {
            window.removeEventListener("popstate", replace);
            window.addEventListener("popstate", flush);
          }

          const state = window.history.state;
          const method = pushOffset ? "pushState" : "replaceState";
          const nextState = [entry, ...state.slice(pushOffset ? 0 : 1)];

          window.history[method](nextState, "", nextUrl);
          flush();
        };

        if (offset) {
          window.removeEventListener("popstate", flush);
          window.addEventListener("popstate", replace);
          window.history.go(offset);
        } else {
          replace();
        }
      }

      function getEntryFromURL(url) {
        const config = getConfigById(url.pathname.substr(2));

        if (!config) {
          for (let i = 0; i < entryPoints.length; i += 1) {
            const params = entryPoints[i].match(url);
            if (params) return entryPoints[i].getEntry(params);
          }

          return null;
        }

        return config.getEntry(config.match(url));
      }

      function navigate(event) {
        const nextEntry = getEntryFromURL(event.detail.url);

        if (!nextEntry) return;

        event.stopPropagation();
        event.detail.event.preventDefault();

        const state = window.history.state;
        const nextConfig = getConfigById(nextEntry.id);
        const currentEntry = state[0];

        let nextUrl = "";
        if (nextConfig.browserUrl) {
          nextUrl = nextConfig.url(nextEntry.params);
        }

        cache.suspend(stack[0]);

        if (nextEntry.id === currentEntry.id) {
          if (nextConfig.options.multiple) {
            const paramEntries = Object.entries(nextEntry.params);
            const offset = state.findIndex(
              ({ id, params }) =>
                nextEntry.id === id &&
                paramEntries.every(([k, value]) => value === params[k]),
            );
            if (offset > -1) {
              navigateBack(offset, nextEntry, nextUrl || options.url);
            } else {
              saveScrollPositions(stack[0]);
              window.history.pushState([nextEntry, ...state], "", nextUrl);
            }
          } else {
            window.history.replaceState(
              [nextEntry, ...state.slice(1)],
              "",
              nextUrl || options.url,
            );

            saveScrollPositions(stack[0]);
            restoreScrollPositions(stack[0], true);
          }
          flush();
        } else {
          let offset = state.findIndex(({ id }) => nextEntry.id === id);
          if (offset > -1) {
            navigateBack(offset, nextEntry, nextUrl || options.url);
          } else {
            const currentConfig = getConfigById(currentEntry.id);
            if (
              nextConfig.options.dialog ||
              (hasInStack(currentConfig, nextConfig) && !currentConfig.guard)
            ) {
              saveScrollPositions(stack[0]);
              window.history.pushState([nextEntry, ...state], "", nextUrl);
              flush();
            } else {
              offset = state
                .slice(1)
                .findIndex(({ id }) =>
                  hasInStack(getConfigById(id), nextConfig),
                );

              navigateBack(
                offset > -1 ? offset : state.length - 1,
                nextEntry,
                nextUrl || options.url,
              );
            }
          }
        }
      }

      if (!window.history.state) {
        const entry =
          getEntryFromURL(new URL(window.location.href)) || roots[0].getEntry();

        window.history.scrollRestoration = "manual";
        window.history.replaceState([entry], "", options.url);
        flush();
      } else {
        const state = window.history.state;
        let i;
        for (i = state.length - 1; i >= 0; i -= 1) {
          const entry = state[i];
          if (
            !customElements.get(entry.id) ||
            (entry.dialog && stack.length === 0)
          ) {
            if (i > 0) {
              window.history.go(-i);
            } else {
              window.history.replaceState(
                [roots[0].getEntry()],
                "",
                options.url,
              );
            }
            break;
          }
        }
        if (i < 0) flush();
      }

      window.addEventListener("popstate", flush);

      host.addEventListener("click", handleNavigate);
      host.addEventListener("submit", handleNavigate);
      host.addEventListener("navigate", navigate);

      return () => {
        window.removeEventListener("popstate", flush);

        host.removeEventListener("click", handleNavigate);
        host.removeEventListener("submit", handleNavigate);
        host.removeEventListener("navigate", navigate);
      };
    },
    observe(host, value) {
      const view = value[value.length - 1];
      if (view) {
        restoreScrollPositions(view);
        if (configs.get(view).options.dialog) {
          view.tabIndex = 0;
          view.focus();
        } else {
          host.focus();
        }
      }
    },
  };
}

export default Object.assign(router, {
  connect,
  url: getUrl,
  backUrl: getBackUrl,
  currentUrl: getCurrentUrl,
  resolve: resolveEvent,
});

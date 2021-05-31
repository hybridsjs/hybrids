import { callbacksMap } from "./define.js";
import * as cache from "./cache.js";
import { dispatch } from "./utils.js";

const connect = Symbol("router.connect");
const configs = new WeakMap();

const flushes = new WeakMap();
const stacks = new WeakMap();
const routers = new WeakMap();

let rootRouter = null;
let entryPoints = [];

function mapDeepElements(target, cb) {
  cb(target);

  const walker = document.createTreeWalker(
    target,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: node =>
        configs.get(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    },
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
const focusMap = new WeakMap();
function saveLayout(target) {
  const focusEl = document.activeElement;
  focusMap.set(target, target.contains(focusEl) && focusEl);

  const map = new Map();

  if (!configs.get(target).nestedParent) {
    const el = document.scrollingElement;
    map.set(el, { left: el.scrollLeft, top: el.scrollTop });
  }

  mapDeepElements(target, el => {
    if (el.scrollLeft || el.scrollTop) {
      map.set(el, { left: el.scrollLeft, top: el.scrollTop });
    }
  });

  scrollMap.set(target, map);
}

let focusTarget = null;
const deffer = Promise.resolve();
function restoreLayout(target, clear) {
  if (!focusTarget) {
    deffer.then(() => {
      const activeEl = document.activeElement;
      if (!focusTarget.contains(activeEl)) {
        const el = scrollMap.get(focusTarget) || focusTarget;
        if (el.tabIndex === -1) {
          el.tabIndex = 0;
          deffer.then(() => el.removeAttribute("tabindex"));
        }
        el.focus({ preventScroll: true });
      }
      focusTarget = null;
    });
  }

  focusTarget = target;

  const map = scrollMap.get(target);

  if (map) {
    deffer.then(() => {
      map.forEach((pos, el) => {
        el.scrollLeft = clear ? 0 : pos.left;
        el.scrollTop = clear ? 0 : pos.top;
      });
    });

    scrollMap.delete(target);
  } else if (!configs.get(target).nestedParent) {
    const el = document.scrollingElement;
    deffer.then(() => {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    });
  }
}

const placeholder = Date.now();
function setupBrowserUrl(browserUrl, id) {
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
            throw Error(`The '${key}' parameter must be defined for <${id}>`);
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
            url.searchParams.append(key, params[key] || "");
          } else {
            throw TypeError(
              `The '${key}' parameter is not supported for <${id}>`,
            );
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

          if (!parts[i] || temp.substr(0, parts[i].length) !== parts[i]) {
            return null;
          }

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

function setupViews(views, options, parent = null, nestedParent = null) {
  if (typeof views === "function") views = views();

  const result = views.map(Constructor => {
    // eslint-disable-next-line no-use-before-define
    const config = setupView(Constructor, options, parent, nestedParent);

    if (parent && hasInStack(config, parent)) {
      throw Error(
        `<${parent.id}> cannot be in the stack of <${config.id}> - it is already in stack of <${parent.id}>`,
      );
    }

    if (config.browserUrl) entryPoints.push(config);

    return config;
  });

  return result;
}

function getNestedRouterOptions(hybrids, id, config) {
  const nestedRouters = Object.values(hybrids)
    .map(desc => routers.get(desc))
    .filter(d => d);

  if (nestedRouters.length) {
    if (nestedRouters.length > 1) {
      throw TypeError(
        `<${id}> must contain at most one nested router: ${nestedRouters.length}`,
      );
    }

    if (config.dialog) {
      throw TypeError(
        `Nested routers are not supported in dialogs. Remove the router property definition from <${id}>`,
      );
    }

    if (config.browserUrl) {
      throw TypeError(
        `A view with nested router must not have the url option. Remove the url option from <${id}>`,
      );
    }
  }
  return nestedRouters[0];
}

function setupView(Constructor, routerOptions, parent, nestedParent) {
  const id = new Constructor().tagName.toLowerCase();
  let config = configs.get(Constructor);

  if (config) {
    if (config.hybrids !== Constructor.hybrids) {
      configs.delete(customElements.get(config.id));
      config = null;
    }
  }

  if (!config) {
    let browserUrl = null;

    let options = {
      dialog: false,
      guard: false,
      multiple: false,
      replace: false,
    };

    const hybrids = Constructor.hybrids;
    if (hybrids) {
      options = { ...options, ...hybrids[connect] };
      const callbacks = callbacksMap.get(Constructor);
      callbacks.push(restoreLayout);

      if (options.dialog) {
        callbacks.push(host => {
          const cb = event => {
            if (event.key === "Escape") {
              event.stopPropagation();
              window.history.go(-1);
            }
          };
          host.addEventListener("keydown", cb);
          return () => {
            host.removeEventListener("keydown", cb);
          };
        });
      }
    }

    const writableParams = new Set();
    Object.keys(Constructor.prototype).forEach(key => {
      const desc = Object.getOwnPropertyDescriptor(Constructor.prototype, key);
      if (desc.set) writableParams.add(key);
    });

    if (options.url) {
      if (options.dialog) {
        throw Error(
          `The 'url' option is not supported for dialogs - remove it from <${id}>`,
        );
      }
      if (typeof options.url !== "string") {
        throw TypeError(
          `The 'url' option in <${id}> must be a string: ${typeof options.url}`,
        );
      }
      browserUrl = setupBrowserUrl(options.url, id);

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
                acc[key] = String(host[key] || "");
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
            `'${key}' parameter in the url is not supported for <${id}>`,
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
      hybrids,
      dialog: options.dialog,
      multiple: options.multiple,
      replace: options.replace,
      guard,
      parent: undefined,
      nestedParent: undefined,
      nestedRoots: undefined,
      parentsWithGuards: undefined,
      stack: [],
      ...(browserUrl || {
        url(params, suppressErrors) {
          const url = new URL("", window.location.origin);

          Object.keys(params).forEach(key => {
            if (writableParams.has(key)) {
              url.searchParams.append(key, params[key] || "");
            } else if (!suppressErrors) {
              throw TypeError(
                `The '${key}' parameter is not supported for <${id}>`,
              );
            }
          });

          return new URL(
            `${routerOptions.url}#@${id}${url.search}`,
            window.location.origin,
          );
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

        el.style.outline = "none";

        return el;
      },
      getEntry(params = {}, other) {
        const entry = { id, params, ...other };
        const guardConfig = config.parentsWithGuards.find(c => !c.guard());

        if (guardConfig) {
          return guardConfig.getEntry(params, { from: entry });
        }

        if (config.guard && config.guard()) {
          return { ...config.stack[0].getEntry(params) };
        }

        if (config.nestedParent) {
          return config.nestedParent.getEntry(params, { nested: entry });
        }

        return entry;
      },
    };

    configs.set(Constructor, config);

    config.parent = parent;
    config.nestedParent = nestedParent;

    if (options.stack) {
      if (options.dialog) {
        throw Error(
          `The 'stack' option is not supported for dialogs - remove it from <${id}>`,
        );
      }
      config.stack = setupViews(
        options.stack,
        routerOptions,
        config,
        nestedParent,
      );
    }
  } else {
    config.parent = parent;
    config.nestedParent = nestedParent;
  }

  config.parentsWithGuards = [];
  while (parent) {
    if (parent.guard) config.parentsWithGuards.unshift(parent);
    parent = parent.parent;
  }

  const nestedRouterOptions =
    config.hybrids && getNestedRouterOptions(config.hybrids, id, config);

  if (nestedRouterOptions) {
    config.nestedRoots = setupViews(
      nestedRouterOptions.views,
      { ...routerOptions, ...nestedRouterOptions },
      config,
      config,
    );

    config.stack = config.stack.concat(config.nestedRoots);
  }

  return config;
}

function getConfigById(id) {
  const Constructor = customElements.get(id);
  return configs.get(Constructor);
}

function getUrl(view, params = {}) {
  const config = configs.get(view);
  return config ? config.url(params) : "";
}

function getBackUrl({ nested = false } = {}) {
  const state = window.history.state;
  if (!state) return "";

  let config;

  if (state.length > 1) {
    let i = 1;
    let prevEntry = state[i];
    if (nested) {
      while (prevEntry.nested) {
        prevEntry = prevEntry.nested;
      }
    } else
      while (prevEntry.nested && i < state.length - 1) {
        i += 1;
        prevEntry = state[i];
      }

    config = getConfigById(prevEntry.id);

    if (!config.guard) {
      return config.url(prevEntry.params);
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
      return config.url(state[0].params, true);
    }
  }

  return "";
}

function getGuardUrl(params = {}) {
  const state = window.history.state;
  if (!state) return "";

  const entry = state[0];

  if (entry.from) {
    const config = getConfigById(entry.from.id);
    return config.url({ ...entry.from.params, ...params });
  }

  const config = getConfigById(entry.id);
  return config.stack[0] ? config.stack[0].url(params) : "";
}

function getCurrentUrl(params) {
  const state = window.history.state;
  if (!state) return "";

  const entry = state[0];
  const config = getConfigById(entry.id);

  return config.url({ ...entry.params, ...params });
}

function active(views, { stack = false } = {}) {
  const state = window.history.state;
  if (!state) return false;

  views = [].concat(views);

  return views.some(view => {
    const config = configs.get(view);
    if (!config) {
      throw TypeError(`Provided view is not connected to the router: ${view}`);
    }

    let entry = state[0];
    while (entry) {
      const target = getConfigById(entry.id);
      if (target === config || (stack && hasInStack(config, target))) {
        return true;
      }
      entry = entry.nested;
    }

    return false;
  });
}

function getEntryFromURL(url) {
  let config;

  const [pathname, search] = url.hash.split("?");
  if (pathname) {
    config = getConfigById(pathname.split("@")[1]);
    url = new URL(`?${search}`, window.location.origin);
  }

  if (!config) {
    for (let i = 0; i < entryPoints.length; i += 1) {
      const entryPoint = entryPoints[i];
      const params = entryPoint.match(url);
      if (params) return entryPoint.getEntry(params);
    }

    return null;
  }

  return config.getEntry(config.match(url));
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

  if (rootRouter && url && url.origin === window.location.origin) {
    const entry = getEntryFromURL(url);
    if (entry) {
      event.preventDefault();

      dispatch(rootRouter, "navigate", {
        bubbles: true,
        detail: { entry, url },
      });
    }
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

function resolveStack(host, state) {
  let stack = stacks.get(host);
  const reducedState = state.reduce((acc, entry, index) => {
    if (
      index === 0 ||
      state[index - 1].id !== entry.id ||
      getConfigById(entry.id).multiple
    ) {
      acc.push(entry);
    }
    return acc;
  }, []);
  const offset = stack.length - reducedState.length;
  const lastStackView = stack[0];

  if (offset <= 0 && stack.length) {
    saveLayout(stack[0]);
  }

  stack = reducedState.map(({ id }, index) => {
    const prevView = stack[index + offset];
    const config = getConfigById(id);
    let nextView;

    if (prevView) {
      const prevConfig = configs.get(prevView);
      if (config.id !== prevConfig.id || (index === 0 && config.replace)) {
        return config.create();
      }
      nextView = prevView;
    } else {
      nextView = config.create();
    }

    if (index === 0 && nextView === prevView) {
      cache.unsuspend(nextView);
    }

    return nextView;
  });

  if (stack[0] === lastStackView) {
    restoreLayout(lastStackView, true);
  }

  Object.assign(stack[0], state[0].params);
  stacks.set(host, stack);

  const flush = flushes.get(stack[0]);
  if (flush) flush();
}

function getEntryOffset(entry) {
  const state = window.history.state.reduce((acc, e, index) => {
    let i = 0;

    while (e) {
      acc[i] = acc[i] || [];
      acc[i][index] = e;
      e = e.nested;
      i += 1;
    }

    return acc;
  }, []);

  let offset = 0;
  let i = 0;
  while (entry) {
    const config = getConfigById(entry.id);
    const currentEntry = state[i][offset];

    if (currentEntry.id !== entry.id) {
      if (config.dialog) return -1;

      let j = offset;
      for (; j < state[i].length; j += 1) {
        const e = state[i][j];
        if (!e || e.id === entry.id) {
          offset = j;
          break;
        }

        const c = getConfigById(e.id);
        if (hasInStack(c, config)) {
          if (j > 0) {
            offset = j - 1;
            break;
          } else {
            return c.guard ? 0 : -1;
          }
        }
      }

      if (j === state[i].length) {
        offset = state[i].length - 1;
      }

      if (offset === -1) return offset;
    } else if (config.multiple) {
      // Push from offset if params not the same
      if (
        !Object.entries(entry.params).every(
          ([key, value]) => currentEntry.params[key] === value,
        )
      ) {
        return offset - 1;
      }
    }

    entry = entry.nested;
    i += 1;
  }

  return offset;
}

function connectRootRouter(host, invalidate, options) {
  function flush() {
    resolveStack(host, window.history.state);
    invalidate();
  }

  function navigateBack(offset, entry, nextUrl) {
    const stateLength = window.history.state.length;
    const targetEntry = window.history.state[offset];
    const pushOffset = offset < stateLength - 1 && stateLength > 2 ? 1 : 0;

    if (targetEntry && entry.id === targetEntry.id) {
      entry = { ...targetEntry, ...entry };
    }

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

  function navigate(entry) {
    const state = window.history.state;

    let nestedEntry = entry;
    while (nestedEntry.nested) nestedEntry = nestedEntry.nested;
    const nestedConfig = getConfigById(nestedEntry.id);

    let url = options.url || "";
    if (nestedConfig.browserUrl) {
      url = nestedConfig.url(entry.params);
    }

    const offset = getEntryOffset(entry);

    if (offset > -1) {
      navigateBack(offset, entry, url);
    } else {
      let stack = stacks.get(host);
      while (stack && stack[0]) {
        cache.suspend(stack[0]);
        stack = stacks.get(stack[0]);
      }

      window.history.pushState([entry, ...state], "", url);
      flush();
    }
  }

  function executeNavigate(event) {
    navigate(event.detail.entry);
  }

  entryPoints = [];
  const roots = setupViews(options.views, options);

  flushes.set(host, flush);
  rootRouter = host;

  window.history.scrollRestoration = "manual";

  if (!window.history.state) {
    const entry =
      getEntryFromURL(new URL(window.location.href)) || roots[0].getEntry();
    window.history.replaceState([entry], "", options.url);
    flush();
  } else {
    const stack = stacks.get(host);
    const state = window.history.state;

    let i;
    for (i = state.length - 1; i >= 0; i -= 1) {
      let entry = state[i];
      while (entry) {
        const config = getConfigById(entry.id);
        if (
          !config ||
          (config.dialog && stack.length === 0) ||
          (!roots.includes(config) && !roots.some(c => hasInStack(c, config)))
        ) {
          break;
        }
        entry = entry.nested;
      }
      if (entry) break;
    }

    if (i > -1) {
      const lastValidEntry = state[i + 1];
      navigateBack(
        state.length - i - 1,
        lastValidEntry || roots[0].getEntry(state[0].params),
        options.url,
      );
    } else {
      let entry = state[0];
      while (entry.nested) entry = entry.nested;

      const nestedConfig = getConfigById(entry.id);
      const resultEntry = nestedConfig.getEntry(entry.params);
      navigate(resultEntry);
    }
  }

  window.addEventListener("popstate", flush);

  host.addEventListener("click", handleNavigate);
  host.addEventListener("submit", handleNavigate);
  host.addEventListener("navigate", executeNavigate);

  return () => {
    window.removeEventListener("popstate", flush);

    host.removeEventListener("click", handleNavigate);
    host.removeEventListener("submit", handleNavigate);
    host.removeEventListener("navigate", executeNavigate);

    rootRouter = null;
  };
}

function connectNestedRouter(host, invalidate) {
  const config = configs.get(host);

  function getNestedState() {
    return window.history.state
      .map(entry => {
        while (entry) {
          if (entry.id === config.id) return entry.nested;
          entry = entry.nested;
        }
        return entry;
      })
      .filter(e => e);
  }

  function flush() {
    resolveStack(host, getNestedState());
    invalidate();
  }

  if (!getNestedState()[0]) {
    const state = window.history.state;
    window.history.replaceState(
      [config.nestedRoots[0].getEntry(state[0].params), ...state.slice(1)],
      "",
    );
  }

  flush();
  flushes.set(host, flush);
}

function router(views, options) {
  options = { url: window.location.pathname, ...options, views };

  const desc = {
    get: host => {
      const stack = stacks.get(host) || [];
      return stack
        .slice(0, stack.findIndex(el => !configs.get(el).dialog) + 1)
        .reverse();
    },
    connect: (host, key, invalidate) => {
      if (!stacks.has(host)) stacks.set(host, []);

      if (configs.has(host)) {
        return connectNestedRouter(host, invalidate);
      }

      return connectRootRouter(host, invalidate, options);
    },
  };

  routers.set(desc, options);
  return desc;
}

export default Object.assign(router, {
  connect,
  url: getUrl,
  resolve: resolveEvent,
  backUrl: getBackUrl,
  guardUrl: getGuardUrl,
  currentUrl: getCurrentUrl,
  active,
});

import global from "./global.js";
import { callbacksMap } from "./define.js";
import * as cache from "./cache.js";
import { dispatch, walkInShadow } from "./utils.js";

const connect = Symbol("router.connect");
const configs = new WeakMap();

const flushes = new WeakMap();
const stacks = new WeakMap();
const routers = new WeakMap();

let rootRouter = null;
const entryPoints = new Set();

let debug = false;
function setDebug(value = true) {
  debug = !!value;
}

const scrollMap = new WeakMap();
const focusMap = new WeakMap();
function saveLayout(target) {
  const focusEl = global.document.activeElement;
  focusMap.set(target, rootRouter.contains(focusEl) && focusEl);

  const map = new Map();

  const rootEl = global.document.scrollingElement;
  map.set(rootEl, { left: rootEl.scrollLeft, top: rootEl.scrollTop });

  walkInShadow(target, (el) => {
    if (el.scrollLeft || el.scrollTop) {
      map.set(el, { left: el.scrollLeft, top: el.scrollTop });
    }
  });

  scrollMap.set(target, map);
}

function focusElement(target) {
  if (target.tabIndex === -1) {
    const outline = target.style.outline;
    target.tabIndex = 0;
    target.style.outline = "none";
    target.addEventListener(
      "blur",
      () => {
        target.removeAttribute("tabindex");
        target.style.outline = outline;
      },
      { once: true },
    );
  }
  target.focus({ preventScroll: true });
}

function restoreLayout(target) {
  const activeEl = global.document.activeElement;

  focusElement(
    focusMap.get(target) ||
      (rootRouter.contains(activeEl) ? activeEl : rootRouter),
  );

  const map = scrollMap.get(target);
  if (map) {
    const config = configs.get(target);
    const state = global.history.state;
    const entry = state.find((e) => e.id === config.id);
    const clear = entry && entry.params.scrollToTop;

    map.forEach((pos, el) => {
      el.scrollLeft = clear ? 0 : pos.left;
      el.scrollTop = clear ? 0 : pos.top;
    });

    scrollMap.delete(target);
  } else {
    const rootEl = global.document.scrollingElement;
    rootEl.scrollLeft = 0;
    rootEl.scrollTop = 0;
  }
}

function mapUrlParam(value) {
  return value === true ? 1 : value || "";
}

const metaParams = ["scrollToTop"];

function setupBrowserUrl(browserUrl, id) {
  const [pathname, search = ""] = browserUrl.split("?");

  const searchParams = search ? search.split(",") : [];
  const normalizedPathname = pathname.replace(/^\//, "").split("/");
  const pathnameParams = normalizedPathname.reduce((params, name) => {
    if (name.startsWith(":")) {
      const key = name.slice(1);
      if (searchParams.includes(key)) {
        throw Error(`The '${key}' already used in search params`);
      }
      if (params.includes(key)) {
        throw Error(`The '${key}' already used in pathname`);
      }
      params.push(key);
    }
    return params;
  }, []);

  return {
    browserUrl,
    pathnameParams,
    paramsKeys: [...searchParams, ...pathnameParams],
    url(params, strict = false) {
      const temp = normalizedPathname.reduce((acc, part) => {
        if (part.startsWith(":")) {
          const key = part.slice(1);

          if (!hasOwnProperty.call(params, key)) {
            throw Error(`The '${key}' parameter must be defined for <${id}>`);
          }

          part = mapUrlParam(params[key]);
        }

        return `${acc}/${part}`;
      }, "");

      const url = new URL(temp, global.location.origin);

      Object.keys(params).forEach((key) => {
        if (
          pathnameParams.includes(key) ||
          (strict && (metaParams.includes(key) || !searchParams.includes(key)))
        ) {
          return;
        }

        url.searchParams.append(key, mapUrlParam(params[key]));
      });

      return url;
    },
    match(url) {
      const params = {};
      const temp = url.pathname.replace(/^\//, "").split("/");

      if (temp.length !== normalizedPathname.length) return null;

      for (let i = 0; i < temp.length; i += 1) {
        const part = temp[i];
        const normalizedPart = normalizedPathname[i];

        if (normalizedPart.startsWith(":")) {
          const key = normalizedPart.slice(1);
          params[key] = part;
        } else if (part !== normalizedPart) {
          return null;
        }
      }

      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      return params;
    },
  };
}

function hasInStack(config, target) {
  return config.stack.some((temp) => {
    if (temp === target) return true;
    return hasInStack(temp, target);
  });
}

function addEntryPoint(config) {
  if (config.browserUrl) {
    entryPoints.add(config);
  }
  config.stack.forEach(addEntryPoint);
}

function setupViews(views, options, parent = null, nestedParent = null) {
  if (typeof views === "function") views = views();
  views = [].concat(views);

  return views.map((hybrids) => {
    const config = configs.get(hybrids);

    if (config && hasInStack(config, parent)) {
      throw Error(
        `<${config.id}> cannot be in the stack of <${parent.id}>, as it is an ancestor in the stack tree`,
      );
    }

    // eslint-disable-next-line no-use-before-define
    return setupView(hybrids, options, parent, nestedParent);
  });
}

function getNestedRouterOptions(hybrids, config) {
  const nestedRouters = Object.values(hybrids)
    .map((desc) => routers.get(desc))
    .filter((d) => d);

  if (nestedRouters.length) {
    if (nestedRouters.length > 1) {
      throw TypeError(
        `<${config.id}> must contain at most one nested router, found: ${nestedRouters.length}`,
      );
    }

    if (config.dialog) {
      throw TypeError(
        `Nested routers are not supported in dialogs. Remove the router property definition from <${config.id}>`,
      );
    }

    if (config.browserUrl) {
      throw TypeError(
        `A view with nested router must not have the url option. Remove the url option from <${config.id}>`,
      );
    }
  }
  return nestedRouters[0];
}

function getConfigById(id) {
  const Constructor = global.customElements.get(id);
  return configs.get(Constructor);
}

function setupView(hybrids, routerOptions, parent, nestedParent) {
  const id = hybrids.tag;
  let config = getConfigById(id);

  if (config && config.hybrids !== hybrids) {
    config = null;
  }

  if (!config) {
    const Constructor = global.customElements.get(id);

    if (!Constructor || Constructor.hybrids !== hybrids) {
      throw Error(
        `<${id}> view must be defined by 'define()' function before it can be used in router factory`,
      );
    }

    let browserUrl = null;

    const options = {
      dialog: false,
      guard: false,
      multiple: false,
      replace: false,
      ...hybrids[connect],
    };

    const callbacks = callbacksMap.get(Constructor);

    if (!nestedParent) {
      callbacks.push(restoreLayout);
    }

    if (options.dialog) {
      callbacks.push((host) => {
        const goBackOnEscKey = (event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            global.history.go(-1);
          }
        };

        const focusDialog = () => {
          focusElement(host);
        };

        const prevActiveEl = global.document.activeElement;
        const root = rootRouter;

        root.addEventListener("focusin", focusDialog);
        host.addEventListener("focusout", focusDialog);
        host.addEventListener("keydown", goBackOnEscKey);

        focusElement(host);

        return () => {
          root.removeEventListener("focusin", focusDialog);
          host.removeEventListener("focusout", focusDialog);
          host.removeEventListener("keydown", goBackOnEscKey);

          focusElement(prevActiveEl);
        };
      });
    }

    const writableParams = [];
    Object.keys(Constructor.prototype).forEach((key) => {
      const desc = Object.getOwnPropertyDescriptor(Constructor.prototype, key);
      if (desc.set) writableParams.push(key);
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

      browserUrl.paramsKeys.forEach((key) => {
        const desc = Object.getOwnPropertyDescriptor(
          Constructor.prototype,
          key,
        );
        if (!desc || !desc.set) {
          throw Error(
            `'${key}' parameter from the url is not ${
              desc ? "writable" : "defined"
            } in <${id}>`,
          );
        }
      });
    }

    const stateParams = writableParams.filter(
      (k) => !routerOptions.params.includes(k) && !metaParams.includes(k),
    );

    callbacksMap.get(Constructor).unshift((_) =>
      cache.observe(
        _,
        connect,
        (host) =>
          stateParams.reduce((acc, key) => {
            const value = mapUrlParam(host[key]).toString();
            if (value !== undefined && value !== hybrids[key]) {
              acc[key] = String(value);
            }
            return acc;
          }, {}),
        (host, params, lastParams) => {
          if (!lastParams) return;

          const state = global.history.state;
          let entry = state[0];
          while (entry.id !== id && entry.nested) entry = entry.nested;

          params = { ...entry.params, ...params };

          global.history.replaceState(
            [config.getEntry(params), ...state.slice(1)],
            "",
            browserUrl ? config.url(params, true) : "",
          );
        },
      ),
    );

    let guard;
    if (options.guard) {
      guard = () => {
        try {
          return options.guard();
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
      parent,
      nestedParent,
      nestedRoots: undefined,
      parentsWithGuards: undefined,
      stack: [],
      ...(browserUrl || {
        url(params) {
          const url = new URL("", global.location.origin);

          Object.keys(params).forEach((key) => {
            url.searchParams.append(key, mapUrlParam(params[key]));
          });

          return new URL(
            `${routerOptions.url}#@${id}${url.search}`,
            global.location.origin,
          );
        },
        match(url) {
          const params = {};
          url.searchParams.forEach((value, key) => {
            if (writableParams.includes(key) || metaParams.includes(key))
              params[key] = value;
          });

          return params;
        },
      }),
      create() {
        const el = new Constructor();
        configs.set(el, config);

        return el;
      },
      getEntry(params = {}, other) {
        const entryParams = Object.keys(params).reduce((acc, key) => {
          if (writableParams.includes(key)) {
            acc[key] = params[key];
          }

          return acc;
        }, {});

        const entry = { id, params: entryParams, ...other };
        const guardConfig = config.parentsWithGuards.find((c) => !c.guard());

        if (guardConfig) {
          return guardConfig.getEntry(params, { from: entry });
        }

        if (config.guard && config.guard()) {
          return { ...config.stack[0].getEntry(params) };
        }

        if (config.nestedParent) {
          return config.nestedParent.getEntry(params, { nested: entry });
        }

        metaParams.forEach((key) => {
          if (hasOwnProperty.call(params, key)) {
            entry.params[key] = params[key];
          }
        });

        return entry;
      },
    };

    configs.set(hybrids, config);
    configs.set(Constructor, config);

    if (parent && !parent.stack.includes(config)) {
      parent.stack.push(config);
    }

    if (options.stack) {
      if (options.dialog) {
        throw Error(
          `The 'stack' option is not supported for dialogs - remove it from <${id}>`,
        );
      }
      setupViews(options.stack, routerOptions, config, nestedParent);
    }
  } else {
    config.parent = parent;
    config.nestedParent = nestedParent;
  }

  if (!parent) {
    addEntryPoint(config);
  }

  config.parentsWithGuards = [];
  while (parent) {
    if (parent.guard) config.parentsWithGuards.unshift(parent);
    parent = parent.parent;
  }

  const nestedRouterOptions = getNestedRouterOptions(hybrids, config);

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

function getUrl(view, params = {}) {
  const config = configs.get(view);
  return config ? config.url(params) : "";
}

function getAllEntryParams(entry) {
  const params = {};
  while (entry) {
    Object.assign(params, entry.params);
    entry = entry.nested;
  }

  return params;
}

function getBackUrl({ nested = false, scrollToTop = false } = {}) {
  const state = global.history.state;
  if (!state) return "";

  if (state.length > 1) {
    const entry = state[0];
    let i = 1;
    let prevEntry = state[i];
    if (nested) {
      while (prevEntry.nested) {
        prevEntry = prevEntry.nested;
      }
    } else {
      while (entry.id === prevEntry.id && i < state.length - 1) {
        i += 1;
        prevEntry = state[i];
      }
    }

    const params = getAllEntryParams(state[i]);

    if (scrollToTop) {
      params.scrollToTop = true;
    } else {
      delete params.scrollToTop;
    }

    return getConfigById(prevEntry.id).url(params);
  }

  let entry = state[0];

  if (nested) {
    while (entry.nested) {
      entry = entry.nested;
    }
  }

  let config = getConfigById(entry.id).parent;

  if (config) {
    while (config && config.guard) {
      config = config.parent;
    }

    if (config) {
      return config.url(getAllEntryParams(state[0]));
    }
  }

  return "";
}

function getGuardUrl(params = {}) {
  const state = global.history.state;
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
  const state = global.history.state;
  if (!state) return "";

  let entry = state[0];
  while (entry.nested) entry = entry.nested;

  const config = getConfigById(entry.id);
  return config.url({ ...entry.params, ...params });
}

function active(views, { stack = false } = {}) {
  const state = global.history.state;
  if (!state) return false;

  views = [].concat(views);

  return views.some((view) => {
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
  if (pathname && pathname.match(/^#@.+-.+/)) {
    config = getConfigById(pathname.split("@")[1]);
    url = new URL(`?${search}`, global.location.origin);
  }

  if (!config) {
    for (const entryPoint of entryPoints) {
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

  if (event.type === "click") {
    if (event.ctrlKey || event.metaKey) return;
    const anchorEl = event
      .composedPath()
      .find((el) => el instanceof global.HTMLAnchorElement);

    if (anchorEl) {
      url = new URL(anchorEl.href, global.location.origin);
    }
  } else {
    url = new URL(event.target.action, global.location.origin);
  }

  if (url && url.origin === global.location.origin) {
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

  return promise.then(() => {
    if (promise === activePromise) {
      global.requestAnimationFrame(() => {
        handleNavigate(pseudoEvent);
      });
      activePromise = null;
    }
  });
}

function resolveStack(host, state, options) {
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

  stack = reducedState.map((entry, index) => {
    const prevView = stack[index + offset];
    const config = getConfigById(entry.id);
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

    if (index === 0) {
      if (nextView === prevView) {
        cache.unsuspend(nextView);

        if (offset === 0 && host === rootRouter && entry.params.scrollToTop) {
          restoreLayout(nextView);
        }
      }
    }

    return nextView;
  });

  stacks.set(host, stack);

  const view = stack[0];
  const flush = flushes.get(view);

  Object.entries(state[0].params).forEach(([key, value]) => {
    if (key in view) view[key] = value;
  });

  options.params.forEach((key) => {
    if (key in view) view[key] = host[key];
  });

  if (flush) flush();
}

function getEntryOffset(entry) {
  const state = global.history.state.reduce((acc, e, index) => {
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
    let j = offset;

    for (; j < state[i].length; j += 1) {
      const e = state[i][j];

      if (config.dialog) {
        return e.id !== entry.id ? -1 : offset;
      }

      if (e.id === entry.id) {
        if (config.multiple) {
          if (
            (config.pathnameParams &&
              config.pathnameParams.every(
                (key) => entry.params[key] === e.params[key],
              )) ||
            Object.entries(entry.params).every(
              ([key, value]) => e.params[key] === value,
            )
          ) {
            offset = j;
            break;
          }
        } else {
          offset = j;
          break;
        }
      }

      const c = getConfigById(e.id);
      if (hasInStack(c, config)) {
        if (config.multiple && state[i][0].id === entry.id) {
          offset -= 1;
          break;
        }

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

    entry = entry.nested;
    i += 1;
  }

  return offset;
}

function connectRootRouter(host, invalidate, options) {
  function restoreScrollRestoration() {
    if (global.history.scrollRestoration === "manual") {
      global.history.scrollRestoration = "auto";
    }
  }

  function flush() {
    resolveStack(host, global.history.state, options);
    invalidate();

    global.requestAnimationFrame(restoreScrollRestoration);
  }

  function navigateBack(offset, entry, nextUrl) {
    const state = global.history.state;
    const targetEntry = global.history.state[offset];
    const pushOffset = offset < state.length - 1 && state.length > 2 ? 1 : 0;
    offset += pushOffset;

    if (targetEntry && entry.id === targetEntry.id) {
      entry = { ...targetEntry, ...entry };
    }

    const replace = (popStateEvent) => {
      if (popStateEvent) {
        global.removeEventListener("popstate", replace);
        global.addEventListener("popstate", flush);
      }

      const method = pushOffset ? "pushState" : "replaceState";
      const nextState = [entry, ...state.slice(offset + (pushOffset ? 0 : 1))];

      if (pushOffset) {
        global.history.scrollRestoration = "manual";
      }

      global.history[method](nextState, "", nextUrl);

      flush();
    };

    if (offset) {
      global.removeEventListener("popstate", flush);
      global.addEventListener("popstate", replace);

      global.history.go(-offset);
    } else {
      replace();
    }
  }

  function navigate(entry) {
    const state = global.history.state;

    let nestedEntry = entry;
    while (nestedEntry.nested) nestedEntry = nestedEntry.nested;
    const nestedConfig = getConfigById(nestedEntry.id);

    const url = nestedConfig.browserUrl
      ? nestedConfig.url(nestedEntry.params, true)
      : options.url;
    const offset = getEntryOffset(entry);

    if (offset > -1) {
      navigateBack(offset, entry, url);
    } else {
      let stack = stacks.get(host);
      saveLayout(stack[0]);

      while (stack && stack[0]) {
        cache.suspend(stack[0]);
        stack = stacks.get(stack[0]);
      }

      global.history.scrollRestoration = "manual";
      global.history.pushState([entry, ...state], "", url);

      flush();
    }
  }

  function executeNavigate(event) {
    navigate(event.detail.entry);
  }

  if (rootRouter) {
    throw Error(
      `An element with root router already connected to the document: <${rootRouter.tagName.toLowerCase()}>`,
    );
  }

  let roots;
  try {
    roots = setupViews(options.views, options);
    rootRouter = host;
    flushes.set(host, flush);
  } catch (e) {
    console.error(
      `Error while connecting router in <${host.tagName.toLowerCase()}>:`,
    );
    throw e;
  }

  const state = global.history.state;

  if (!state) {
    const entry =
      getEntryFromURL(new URL(global.location.href)) || roots[0].getEntry();

    global.history.replaceState([entry], "", options.url);
    flush();
  } else {
    const stack = stacks.get(host);

    let i;
    for (i = state.length - 1; i >= 0; i -= 1) {
      let entry = state[i];
      while (entry) {
        const config = getConfigById(entry.id);
        if (
          !config ||
          (config.dialog && stack.length === 0) ||
          (!roots.includes(config) && !roots.some((c) => hasInStack(c, config)))
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

  global.addEventListener("popstate", flush);

  host.addEventListener("click", handleNavigate);
  host.addEventListener("submit", handleNavigate);
  host.addEventListener("navigate", executeNavigate);

  return () => {
    global.removeEventListener("popstate", flush);

    host.removeEventListener("click", handleNavigate);
    host.removeEventListener("submit", handleNavigate);
    host.removeEventListener("navigate", executeNavigate);

    entryPoints.clear();
    rootRouter = null;
  };
}

function connectNestedRouter(host, invalidate, options) {
  const config = configs.get(host);

  function getNestedState() {
    return global.history.state
      .map((entry) => {
        while (entry) {
          if (entry.id === config.id) return entry.nested;
          entry = entry.nested;
        }
        return entry;
      })
      .filter((e) => e);
  }

  function flush() {
    resolveStack(host, getNestedState(), options);
    invalidate();
  }

  if (!getNestedState()[0]) {
    const state = global.history.state;
    global.history.replaceState(
      [config.nestedRoots[0].getEntry(state[0].params), ...state.slice(1)],
      "",
    );
  }

  flush();
  flushes.set(host, flush);
}

function router(views, options) {
  options = {
    url: global.location.href.replace(/#.*$/, ""),
    params: [],
    ...options,
    views,
  };

  const desc = {
    get: (host) => {
      const stack = stacks.get(host) || [];
      return stack
        .slice(0, stack.findIndex((el) => !configs.get(el).dialog) + 1)
        .reverse();
    },
    connect: (host, key, invalidate) => {
      options.params.forEach((param) => {
        if (!(param in host)) {
          throw Error(
            `Property '${param}' for global parameters is not defined in <${host.tagName.toLowerCase()}>`,
          );
        }
      });

      if (!stacks.has(host)) stacks.set(host, []);

      if (configs.has(host)) {
        return connectNestedRouter(host, invalidate, options);
      }

      return connectRootRouter(host, invalidate, options);
    },
    observe:
      debug &&
      ((host, value, lastValue) => {
        const index = value.length - 1;
        const view = value[index];

        if (lastValue && view === lastValue[index]) return;

        let config = configs.get(host);
        let entry = global.history.state[0];
        let key = 0;

        while (config) {
          key += 1;
          entry = entry.nested;
          config = config.nestedParent;
        }

        console.groupCollapsed(
          `[${host.tagName.toLowerCase()}]: navigated to <${
            entry.id
          }> ($$${key})`,
        );

        Object.entries(entry.params).forEach(([k, v]) =>
          console.log(`%c${k}:`, "font-weight: bold", v),
        );

        console.groupEnd();

        global[`$$${key}`] = view;
      }),
  };

  routers.set(desc, options);
  return desc;
}

export default Object.freeze(
  Object.assign(router, {
    connect,
    debug: setDebug,
    url: getUrl,
    backUrl: getBackUrl,
    guardUrl: getGuardUrl,
    currentUrl: getCurrentUrl,
    resolve: resolveEvent,
    active,
  }),
);

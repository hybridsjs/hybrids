import { defineElement, callbacksMap } from "./define.js";
import * as cache from "./cache.js";
import { dispatch, pascalToDash } from "./utils.js";

/*

# TODO LIST

* Nested routers:
  * navigate push on self (nested parent)
  
* is active route helper
* Transition effect

*/

const connect = Symbol("router.connect");
const routers = new WeakMap();
const configs = new WeakMap();
const routerSettings = new WeakMap();

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
  focusMap.set(target, target.contains(focusEl) ? focusEl : target);
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

// let focusTarget;
function restoreLayout(target, clear) {
  // const focusEl = focusMap.get(target) || target;

  // if (!focusTarget) {
  //   requestAnimationFrame(() => {
  //     focusTarget.focus({ preventScroll: true });
  //     focusTarget = null;
  //   });
  // }

  // focusTarget = focusEl;

  const map = scrollMap.get(target);

  if (map && !clear) {
    Promise.resolve().then(() => {
      map.forEach((pos, el) => {
        el.scrollLeft = pos.left;
        el.scrollTop = pos.top;
      });
    });

    scrollMap.delete(target);
  } else if (!configs.get(target).nestedParent) {
    const el = document.scrollingElement;
    Promise.resolve().then(() => {
      el.scrollLeft = 0;
      el.scrollTop = 0;
    });
  }
}

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
            url.searchParams.append(key, params[key] || "");
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

function getNestedRouterSettings(name, view, options) {
  const nestedRouters = Object.values(view)
    .map(desc => routerSettings.get(desc))
    .filter(d => d);

  if (nestedRouters.length) {
    if (nestedRouters.length > 1) {
      throw TypeError(
        `'${name}' view must contain at most one nested router: ${nestedRouters.length}`,
      );
    }

    if (options.dialog) {
      throw TypeError(
        `Nested routers are not supported in dialogs. Remove the router factory from '${name}' view`,
      );
    }

    if (options.url) {
      throw TypeError(
        `Views with nested routers must not have the url option. Remove either the router factory or the url option from '${name}' view`,
      );
    }
  }
  return nestedRouters[0];
}

function setupViews(views, prefix = "view", parent = null) {
  if (typeof views === "function") views = views();

  const result = Object.entries(views).map(([name, view]) => {
    // eslint-disable-next-line no-use-before-define
    const config = setupView(name, view, prefix, parent);

    if (parent && hasInStack(config, parent)) {
      throw Error(
        `${parent.name} cannot be in the stack of ${config.name} - ${config.name} already connected to ${parent.name}`,
      );
    }

    return config;
  });

  return result;
}

function setupView(name, view, prefix, parent) {
  const id = `${pascalToDash(prefix)}-${pascalToDash(name)}`;

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
    callbacksMap.get(Constructor).push(restoreLayout);

    const writableParams = new Set();
    Object.keys(Constructor.prototype).forEach(key => {
      const desc = Object.getOwnPropertyDescriptor(Constructor.prototype, key);
      if (desc.set) writableParams.add(key);
    });

    const nestedRouterSettings = getNestedRouterSettings(name, view, options);

    if (options.dialog) {
      callbacksMap.get(Constructor).push(host => {
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

    if (options.url) {
      if (options.dialog) {
        throw Error(
          `The 'url' option is not supported for dialogs - remove it from '${name}'`,
        );
      }
      if (typeof options.url !== "string") {
        throw TypeError(
          `The 'url' option in '${name}' must be a string: ${typeof options.url}`,
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
            `'${key}' parameter in the url is not supported by the '${name}'`,
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
      dialog: options.dialog,
      multiple: options.multiple,
      guard,
      parent: undefined,
      parentsWithGuards: undefined,
      stack: [],
      nestedParent: undefined,
      nested: nestedRouterSettings ? nestedRouterSettings.roots : null,
      ...(browserUrl || {
        url(params) {
          const url = new URL(`@${id}`, window.location.origin);

          Object.keys(params).forEach(key => {
            if (writableParams.has(key)) {
              url.searchParams.append(key, params[key] || "");
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

        el.style.outline = "none";
        el.tabIndex = 0;

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

    configs.set(view, config);
    configs.set(Constructor, config);

    if (options.stack) {
      if (options.dialog) {
        throw Error(
          `The 'stack' option is not supported for dialogs - remove it from '${name}'`,
        );
      }
      config.stack = setupViews(options.stack, prefix, config);
    }

    if (nestedRouterSettings) {
      config.stack = config.stack.concat(nestedRouterSettings.roots);
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
    throw Error(`Provided view is not connected to the router`);
  }

  return config.url(params);
}

function getBackUrl(params = {}) {
  const state = window.history.state;
  if (!state) return "";

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

function isActive(...views) {
  const state = window.history.state;
  if (!state) return false;

  return views.some(view => {
    const config = configs.get(view);
    if (!config) {
      throw TypeError("The first argument must be connected view definition");
    }

    let entry = state[0];
    while (entry) {
      const target = getConfigById(entry.id);
      if (target === config || hasInStack(config, target)) return true;
      entry = entry.nested;
    }

    return false;
  });
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
    const target = event
      .composedPath()
      .reverse()
      .find(el => routers.has(el));

    dispatch(target, "navigate", { detail: { url, event } });
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

function resolveStack(state, settings) {
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
  const offset = settings.stack.length - reducedState.length;

  if (offset < 0 && settings.stack.length) {
    saveLayout(settings.stack[0]);
  }

  settings.stack = reducedState.map(({ id }, index) => {
    const prevView = settings.stack[index + offset];
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

  Object.assign(settings.stack[0], state[0].params);

  const nestedFlush = routers.get(settings.stack[0]);
  if (nestedFlush) nestedFlush();
}

function findSameEntryIndex(state, entry) {
  return state.findIndex(e => {
    let temp = entry;
    while (e) {
      if (e.id !== temp.id) return false;

      const config = getConfigById(e.id);
      if (!config.multiple && !entry.nested) return true;

      if (
        !Object.entries(e.params).every(
          ([key, value]) => entry.params[key] === value,
        )
      ) {
        return false;
      }

      e = e.nested;
      temp = entry.nested;
    }
    return true;
  });
}

function connectRootRouter(host, invalidate, settings) {
  function flush() {
    resolveStack(window.history.state, settings);
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

  function getEntryFromURL(url) {
    const config = getConfigById(url.pathname.substr(2));

    if (!config) {
      for (let i = 0; i < settings.entryPoints.length; i += 1) {
        const entryPoint = settings.entryPoints[i];
        const params = entryPoint.match(url);
        if (params) return entryPoint.getEntry(params);
      }

      return null;
    }

    return config.getEntry(config.match(url));
  }

  function navigate(event) {
    const nextEntry = getEntryFromURL(event.detail.url);
    if (!nextEntry) return;

    event.stopPropagation();

    if (event.detail.event) {
      event.detail.event.preventDefault();
    }

    const state = window.history.state;
    const nextConfig = getConfigById(nextEntry.id);
    const currentEntry = state[0];

    let nextUrl = "";
    if (nextConfig.browserUrl) {
      nextUrl = nextConfig.url(nextEntry.params);
    }

    cache.suspend(settings.stack[0]);

    if (nextEntry.id === currentEntry.id) {
      const offset = findSameEntryIndex(state, nextEntry);
      if (offset > -1) {
        navigateBack(offset, nextEntry, nextUrl || settings.url);
        restoreLayout(settings.stack[0], true);
      } else {
        window.history.pushState([nextEntry, ...state], "", nextUrl);
        flush();
      }
    } else {
      let offset = state.findIndex(({ id }) => nextEntry.id === id);
      if (offset > -1) {
        navigateBack(offset, nextEntry, nextUrl || settings.url);
      } else {
        const currentConfig = getConfigById(currentEntry.id);
        if (
          nextConfig.dialog ||
          (hasInStack(currentConfig, nextConfig) && !currentConfig.guard)
        ) {
          window.history.pushState([nextEntry, ...state], "", nextUrl);
          flush();
        } else {
          offset = state
            .slice(1)
            .findIndex(({ id }) => hasInStack(getConfigById(id), nextConfig));

          navigateBack(
            offset > -1 ? offset : state.length - 1,
            nextEntry,
            nextUrl || settings.url,
          );
        }
      }
    }
  }

  routers.set(host, flush);

  if (!window.history.state) {
    const entry =
      getEntryFromURL(new URL(window.location.href)) ||
      settings.roots[0].getEntry();

    window.history.scrollRestoration = "manual";
    window.history.replaceState([entry], "", settings.url);
    flush();
  } else {
    const state = window.history.state;
    let i;
    for (i = state.length - 1; i >= 0; i -= 1) {
      const entry = state[i];
      const config = getConfigById(entry.id);
      if (!config || (config.dialog && settings.stack.length === 0)) {
        if (state.length > 1) {
          window.history.go(-(state.length - i - 1));
        } else {
          window.history.replaceState(
            [settings.roots[0].getEntry()],
            "",
            settings.url,
          );
          flush();
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

    routers.delete(host);
  };
}

function connectNestedRouter(host, invalidate, settings) {
  const viewConfig = configs.get(host);
  if (!viewConfig) return false;

  function getNestedState() {
    return window.history.state.map(entry => {
      while (entry) {
        if (entry.id === viewConfig.id) return entry.nested;
        entry = entry.nested;
      }
      return entry;
    });
  }

  function flush() {
    resolveStack(getNestedState(), settings);
    invalidate();
  }

  if (!getNestedState()[0]) {
    window.history.replaceState(
      [settings.roots[0].getEntry(), ...window.history.state.slice(1)],
      "",
    );
  }

  routers.set(host, flush);
  flush();

  return () => {
    routers.delete(host);
  };
}

function router(views, settings = {}) {
  settings = {
    url: settings.url || "/",
    params: settings.params || [],
    roots: setupViews(views, settings.prefix),
    stack: [],
    entryPoints: [],
  };

  if (!settings.roots.length) {
    throw TypeError(
      `The first argument must be a non-empty map of views: ${views}`,
    );
  }

  deepEach(settings.roots, (c, parent) => {
    c.parent = parent;

    if (parent && parent.nested && parent.nested.includes(c)) {
      c.nestedParent = parent;
    }

    let tempParent = parent;
    c.parentsWithGuards = [];
    while (tempParent) {
      if (tempParent.guard) c.parentsWithGuards.unshift(tempParent);
      tempParent = tempParent.parent;
    }

    if (c.browserUrl) settings.entryPoints.push(c);
  });

  const desc = {
    get: host => {
      const stack = settings.stack
        .slice(0, settings.stack.findIndex(el => !configs.get(el).dialog) + 1)
        .reverse();

      const el = stack[stack.length - 1];
      settings.params.forEach(key => {
        el[key] = host[key];
      });

      return stack;
    },
    connect: (host, key, invalidate) =>
      configs.get(host)
        ? connectNestedRouter(host, invalidate, settings)
        : connectRootRouter(host, invalidate, settings),
  };

  routerSettings.set(desc, settings);

  return desc;
}

export default Object.assign(router, {
  connect,
  url: getUrl,
  backUrl: getBackUrl,
  guardUrl: getGuardUrl,
  isActive,
  resolve: resolveEvent,
});

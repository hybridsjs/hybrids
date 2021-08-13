/* eslint-disable no-use-before-define */
import * as cache from "./cache.js";
import { storePointer } from "./utils.js";

const connect = Symbol("store.connect");

const definitions = new WeakMap();
const stales = new WeakMap();
const refs = new WeakSet();

function resolve(config, model, lastModel) {
  if (lastModel) {
    definitions.set(lastModel, null);
    stales.set(lastModel, model);
  }

  definitions.set(model, config);

  return model;
}

function shallowEqual(target, compare) {
  return Object.keys(target).every(key => target[key] === compare[key]);
}

function resolveWithInvalidate(config, model, lastModel) {
  resolve(config, model, lastModel);

  if (
    config.invalidate &&
    (!lastModel ||
      error(model) ||
      !config.isInstance(lastModel) ||
      !shallowEqual(model, lastModel))
  ) {
    config.invalidate();
  }

  return model;
}

function syncCache(config, id, model, invalidate = true) {
  cache.set(config, id, invalidate ? resolveWithInvalidate : resolve, model);
  return model;
}

let currentTimestamp;
function getCurrentTimestamp() {
  if (!currentTimestamp) {
    currentTimestamp = Date.now();
    requestAnimationFrame(() => {
      currentTimestamp = undefined;
    });
  }
  return currentTimestamp;
}

const timestamps = new WeakMap();

function getTimestamp(model) {
  let timestamp = timestamps.get(model);

  if (!timestamp) {
    timestamp = getCurrentTimestamp();
    timestamps.set(model, timestamp);
  }

  return timestamp;
}

function setTimestamp(model) {
  timestamps.set(model, getCurrentTimestamp());
  return model;
}

function invalidateTimestamp(model) {
  timestamps.set(model, 1);
  return model;
}

function hashCode(str) {
  return window.btoa(
    Array.from(str).reduce(
      // eslint-disable-next-line no-bitwise
      (s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0,
      0,
    ),
  );
}

const offlinePrefix = "hybrids:store:cache";
const offlineKeys = {};

let clearPromise;
function setupOfflineKey(config, threshold) {
  const key = `${offlinePrefix}:${hashCode(JSON.stringify(config.model))}`;

  offlineKeys[key] = getCurrentTimestamp() + threshold;

  if (!clearPromise) {
    clearPromise = Promise.resolve().then(() => {
      const previousKeys =
        JSON.parse(window.localStorage.getItem(offlinePrefix)) || {};
      const timestamp = getCurrentTimestamp();

      Object.keys(previousKeys).forEach(k => {
        /* istanbul ignore next */
        if (!offlineKeys[k] && previousKeys[k] < timestamp) {
          window.localStorage.removeItem(k);
          delete previousKeys[k];
        }
      });

      window.localStorage.setItem(
        offlinePrefix,
        JSON.stringify({ ...previousKeys, ...offlineKeys }),
      );
      clearPromise = null;
    });
  }

  return key;
}

function setupStorage(config, options) {
  if (typeof options === "function") options = { get: options };

  const result = { cache: true, loose: false, ...options };

  if (result.cache === false || result.cache === 0) {
    result.validate = cachedModel =>
      !cachedModel || getTimestamp(cachedModel) === getCurrentTimestamp();
  } else if (typeof result.cache === "number") {
    result.validate = cachedModel =>
      !cachedModel ||
      getTimestamp(cachedModel) + result.cache > getCurrentTimestamp();
  } else if (result.cache !== true) {
    throw TypeError(
      `Storage cache property must be a boolean or number: ${typeof result.cache}`,
    );
  }

  if (!result.get) {
    result.get = id => {
      throw notFoundError(stringifyId(id));
    };
  }

  if (result.offline) {
    const isBool = result.offline === true;
    const threshold = isBool
      ? 1000 * 60 * 60 * 24 * 30 /* 30 days */
      : result.offline;
    const offlineKey = setupOfflineKey(config, threshold);

    try {
      const items = JSON.parse(window.localStorage.getItem(offlineKey)) || {};

      let flush;

      result.offline = Object.freeze({
        key: offlineKey,
        threshold,
        get: isBool
          ? id => {
              if (hasOwnProperty.call(items, id)) {
                return JSON.parse(items[id][1]);
              }
              return null;
            }
          : id => {
              if (hasOwnProperty.call(items, id)) {
                const item = items[id];
                if (item[0] + threshold < getCurrentTimestamp()) {
                  delete items[id];
                  return null;
                }
                return JSON.parse(item[1]);
              }
              return null;
            },
        set(id, values) {
          if (values) {
            items[id] = [
              getCurrentTimestamp(),
              JSON.stringify(values, function replacer(key, value) {
                if (value === this[""]) return value;

                if (value && typeof value === "object") {
                  const valueConfig = definitions.get(value);
                  const offline = valueConfig && valueConfig.storage.offline;
                  if (offline) {
                    if (valueConfig.list) {
                      return value.map(model => {
                        configs
                          .get(valueConfig.model)
                          .storage.offline.set(model.id, model);
                        return `${model}`;
                      });
                    }

                    valueConfig.storage.offline.set(value.id, value);
                    return `${value}`;
                  }
                }

                return value;
              }),
            ];
          } else {
            delete items[id];
          }

          if (!flush) {
            flush = Promise.resolve().then(() => {
              const timestamp = getCurrentTimestamp();

              Object.keys(items).forEach(key => {
                if (items[key][0] + threshold < timestamp) {
                  delete items[key];
                }
              });

              window.localStorage.setItem(offlineKey, JSON.stringify(items));
              flush = null;
            });
          }

          return values;
        },
      });
    } catch (e) /* istanbul ignore next */ {
      console.error(e);
      result.offline = false;
    }
  }

  return Object.freeze(result);
}

function memoryStorage(config) {
  return {
    get: config.enumerable ? () => {} : () => config.create({}),
    set: config.enumerable
      ? (id, values) => values
      : (id, values) => (values === null ? { id } : values),
    list:
      config.enumerable &&
      function list(id) {
        if (id) {
          throw TypeError(`Memory-based model definition does not support id`);
        }

        return cache.getEntries(config).reduce((acc, { key, value }) => {
          if (key === config) return acc;
          if (value && !error(value)) acc.push(key);
          return acc;
        }, []);
      },
    loose: true,
  };
}

function bootstrap(Model, nested) {
  if (Array.isArray(Model)) {
    return setupListModel(Model[0], nested);
  }
  return setupModel(Model, nested);
}

function getTypeConstructor(type, key) {
  switch (type) {
    case "string":
      return v => (v !== undefined && v !== null ? String(v) : "");
    case "number":
      return Number;
    case "boolean":
      return Boolean;
    default:
      throw TypeError(
        `The value of the '${key}' must be a string, number or boolean: ${type}`,
      );
  }
}

const stateSetter = (_, value, lastValue) => {
  if (value.state === "error") {
    return { state: "error", error: value.value };
  }

  value.error = !!lastValue && lastValue.error;

  return value;
};
function setModelState(model, state, value = model) {
  cache.set(model, "state", stateSetter, { state, value });
  return model;
}

const stateGetter = (
  model,
  v = { state: "ready", value: model, error: false },
) => v;
function getModelState(model) {
  return cache.get(model, "state", stateGetter);
}

// UUID v4 generator thanks to https://gist.github.com/jed/982883
function uuid(temp) {
  return temp
    ? // eslint-disable-next-line no-bitwise, no-mixed-operators
      (temp ^ ((Math.random() * 16) >> (temp / 4))).toString(16)
    : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);
}

function ref(fn) {
  if (typeof fn !== "function") {
    throw TypeError(`The first argument must be a funtion: ${typeof fn}`);
  }

  refs.add(fn);
  return fn;
}

const validationMap = new WeakMap();
function resolveKey(Model, key, config) {
  let defaultValue = config.model[key];
  if (refs.has(defaultValue)) defaultValue = defaultValue();
  let type = typeof defaultValue;

  if (defaultValue instanceof String || defaultValue instanceof Number) {
    const check = validationMap.get(defaultValue);
    if (!check) {
      throw TypeError(
        stringifyModel(
          Model,
          `You must use primitive ${typeof defaultValue.valueOf()} value for '${key}' property of the provided model definition`,
        ),
      );
    }

    defaultValue = defaultValue.valueOf();
    type = typeof defaultValue;

    config.checks.set(key, check);
  }

  return { defaultValue, type };
}

function stringifyModel(Model, msg) {
  return `${msg}\n\nModel = ${JSON.stringify(Model, null, 2)}\n`;
}

const resolvedPromise = Promise.resolve();
export const configs = new WeakMap();
function setupModel(Model, nested) {
  if (typeof Model !== "object" || Model === null) {
    throw TypeError(`Model definition must be an object: ${typeof Model}`);
  }

  let config = configs.get(Model);

  if (config && !config.enumerable) {
    if (nested && !config.nested) {
      throw TypeError(
        stringifyModel(
          Model,
          "Provided model definition for nested object already used as a root definition",
        ),
      );
    }

    if (!nested && config.nested) {
      throw TypeError(
        stringifyModel(
          Model,
          "Nested model definition cannot be used outside of the parent definition",
        ),
      );
    }
  }

  if (!config) {
    const storage = Model[connect];
    if (typeof storage === "object") Object.freeze(storage);

    let invalidatePromise;
    const enumerable = hasOwnProperty.call(Model, "id");
    const external = !!storage;

    const checks = new Map();

    const proto = {
      toString() {
        return this.id || undefined;
      },
    };
    const placeholder = Object.create(proto);

    config = {
      model: Model,
      external,
      enumerable,
      nested: !enumerable && !external && nested,
      placeholder: id => {
        const model = Object.create(placeholder);
        definitions.set(model, config);

        if (enumerable) model.id = id;

        return Object.freeze(model);
      },
      isInstance: model => Object.getPrototypeOf(model) !== placeholder,
      invalidate: () => {
        if (!invalidatePromise) {
          invalidatePromise = resolvedPromise.then(() => {
            cache.invalidate(config, config, { clearValue: true });
            invalidatePromise = null;
          });
        }
      },
      checks,
    };

    configs.set(Model, config);

    config.storage = setupStorage(config, storage || memoryStorage(config));

    const transform = Object.keys(Object.freeze(Model)).map(key => {
      if (key !== "id") {
        Object.defineProperty(placeholder, key, {
          get() {
            throw Error(
              `Model instance in ${
                getModelState(this).state
              } state - use store.pending(), store.error(), or store.ready() guards`,
            );
          },
          enumerable: true,
        });
      }

      if (key === "id") {
        if (Model[key] !== true) {
          throw TypeError(
            "The 'id' property in model definition must be set to 'true' or not be defined",
          );
        }
        return (model, data, lastModel) => {
          let id;
          if (hasOwnProperty.call(data, "id")) {
            id = stringifyId(data.id);
          } else if (lastModel) {
            id = lastModel.id;
          } else {
            id = uuid();
          }

          Object.defineProperty(model, "id", { value: id, enumerable: true });
        };
      }

      const { defaultValue, type } = resolveKey(Model, key, config);

      switch (type) {
        case "function":
          return model => {
            let resolved;
            let value;

            Object.defineProperty(model, key, {
              get() {
                if (!resolved) {
                  value = defaultValue(this);
                  resolved = true;
                }
                return value;
              },
            });
          };
        case "object": {
          if (defaultValue === null) {
            throw TypeError(
              `The value for the '${key}' must be an object instance: ${defaultValue}`,
            );
          }

          const isArray = Array.isArray(defaultValue);

          if (isArray) {
            const nestedType = typeof defaultValue[0];

            if (nestedType !== "object") {
              const Constructor = getTypeConstructor(nestedType, key);
              const defaultArray = Object.freeze(defaultValue.map(Constructor));
              return (model, data, lastModel) => {
                if (hasOwnProperty.call(data, key)) {
                  if (!Array.isArray(data[key])) {
                    throw TypeError(
                      `The value for '${key}' property must be an array: ${typeof data[
                        key
                      ]}`,
                    );
                  }
                  model[key] = Object.freeze(data[key].map(Constructor));
                } else if (lastModel && hasOwnProperty.call(lastModel, key)) {
                  model[key] = lastModel[key];
                } else {
                  model[key] = defaultArray;
                }
              };
            }

            const localConfig = bootstrap(defaultValue, true);

            if (
              localConfig.external &&
              config.storage.offline &&
              localConfig.storage.offline &&
              localConfig.storage.offline.threshold <
                config.storage.offline.threshold
            ) {
              throw Error(
                `External nested model for '${key}' property has lower offline threshold (${localConfig.storage.offline.threshold} ms) than the parent definition (${config.storage.offline.threshold} ms)`,
              );
            }

            if (localConfig.enumerable && defaultValue[1]) {
              const nestedOptions = defaultValue[1];
              if (typeof nestedOptions !== "object") {
                throw TypeError(
                  `Options for '${key}' array property must be an object instance: ${typeof nestedOptions}`,
                );
              }
              if (nestedOptions.loose) {
                config.contexts = config.contexts || new Set();
                config.contexts.add(bootstrap(defaultValue[0]));
              }
            }
            return (model, data, lastModel) => {
              if (hasOwnProperty.call(data, key)) {
                if (!Array.isArray(data[key])) {
                  throw TypeError(
                    `The value for '${key}' property must be an array: ${typeof data[
                      key
                    ]}`,
                  );
                }
                model[key] = localConfig.create(data[key], true);
              } else {
                model[key] =
                  (lastModel && lastModel[key]) ||
                  (!localConfig.enumerable &&
                    localConfig.create(defaultValue)) ||
                  [];
              }
            };
          }

          const nestedConfig = bootstrap(defaultValue, true);
          if (nestedConfig.enumerable || nestedConfig.external) {
            if (
              config.storage.offline &&
              nestedConfig.storage.offline &&
              nestedConfig.storage.offline.threshold <
                config.storage.offline.threshold
            ) {
              throw Error(
                `External nested model for '${key}' property has lower offline threshold (${nestedConfig.storage.offline.threshold} ms) than the parent definition (${config.storage.offline.threshold} ms)`,
              );
            }
            return (model, data, lastModel) => {
              let resultModel;

              if (hasOwnProperty.call(data, key)) {
                const nestedData = data[key];

                if (typeof nestedData !== "object" || nestedData === null) {
                  if (nestedData !== undefined && nestedData !== null) {
                    resultModel = { id: nestedData };
                  }
                } else {
                  const dataConfig = definitions.get(nestedData);
                  if (dataConfig) {
                    if (dataConfig.model !== defaultValue) {
                      throw TypeError(
                        "Model instance must match the definition",
                      );
                    }
                    resultModel = nestedData;
                  } else {
                    resultModel = nestedConfig.create(nestedData);
                    syncCache(nestedConfig, resultModel.id, resultModel);
                  }
                }
              } else {
                resultModel = lastModel && lastModel[key];
              }

              if (resultModel) {
                const id = resultModel.id;
                Object.defineProperty(model, key, {
                  get() {
                    return cache.get(this, key, () => get(defaultValue, id));
                  },
                  enumerable: true,
                });
              } else {
                model[key] = undefined;
              }
            };
          }

          return (model, data, lastModel) => {
            if (hasOwnProperty.call(data, key)) {
              model[key] = nestedConfig.create(
                data[key],
                lastModel && lastModel[key],
              );
            } else {
              model[key] = lastModel ? lastModel[key] : nestedConfig.create({});
            }
          };
        }
        // eslint-disable-next-line no-fallthrough
        default: {
          const Constructor = getTypeConstructor(type, key);
          return (model, data, lastModel) => {
            if (hasOwnProperty.call(data, key)) {
              model[key] = Constructor(data[key]);
            } else if (lastModel && hasOwnProperty.call(lastModel, key)) {
              model[key] = lastModel[key];
            } else {
              model[key] = defaultValue;
            }
          };
        }
      }
    });

    config.create = function create(data, lastModel) {
      if (data === null) return null;

      if (typeof data !== "object") {
        throw TypeError(`Model values must be an object instance: ${data}`);
      }

      const model = transform.reduce((acc, fn) => {
        fn(acc, data, lastModel);
        return acc;
      }, Object.create(proto));

      definitions.set(model, config);
      storePointer.set(model, store);

      return Object.freeze(model);
    };

    Object.freeze(placeholder);
    Object.freeze(config);
  }

  return config;
}

const listPlaceholderPrototype = Object.getOwnPropertyNames(
  Array.prototype,
).reduce((acc, key) => {
  if (key === "length" || key === "constructor") return acc;

  Object.defineProperty(acc, key, {
    get() {
      throw Error(
        `Model list instance in ${
          getModelState(this).state
        } state - use store.pending(), store.error(), or store.ready() guards`,
      );
    },
  });
  return acc;
}, []);

export const lists = new WeakMap();
function setupListModel(Model, nested) {
  let config = lists.get(Model);

  if (config && !config.enumerable) {
    if (!nested && config.nested) {
      throw TypeError(
        stringifyModel(
          Model,
          "Nested model definition cannot be used outside of the parent definition",
        ),
      );
    }
  }

  if (!config) {
    const modelConfig = setupModel(Model);

    const contexts = new Set();
    if (modelConfig.storage.loose) contexts.add(modelConfig);

    if (!nested) {
      if (!modelConfig.enumerable) {
        throw TypeError(
          stringifyModel(
            Model,
            "Provided model definition does not support listing (it must be enumerable - set `id` property to `true`)",
          ),
        );
      }
      if (!modelConfig.storage.list) {
        throw TypeError(
          stringifyModel(
            Model,
            "Provided model definition storage does not support `list` action",
          ),
        );
      }
    }

    nested = !modelConfig.enumerable && !modelConfig.external && nested;

    config = {
      list: true,
      nested,
      model: Model,
      contexts,
      enumerable: modelConfig.enumerable,
      external: modelConfig.external,
      storage: Object.freeze({
        ...setupStorage(config, {
          cache: modelConfig.storage.cache,
          get: !nested && (id => modelConfig.storage.list(id)),
        }),
        offline: modelConfig.storage.offline && {
          threshold: modelConfig.storage.offline.threshold,
          get: id => {
            const result = modelConfig.storage.offline.get(
              hashCode(String(stringifyId(id))),
            );
            return result
              ? result.map(item => modelConfig.storage.offline.get(item))
              : null;
          },
          set: (id, values) => {
            modelConfig.storage.offline.set(
              hashCode(String(stringifyId(id))),
              values.map(item => {
                modelConfig.storage.offline.set(item.id, item);
                return item.id;
              }),
            );
          },
        },
      }),
      placeholder: () => {
        const model = Object.create(listPlaceholderPrototype);
        definitions.set(model, config);

        return Object.freeze(model);
      },
      isInstance: model =>
        Object.getPrototypeOf(model) !== listPlaceholderPrototype,
      create(items, invalidate = false) {
        if (items === null) return null;

        const result = items.reduce((acc, data) => {
          let id = data;
          if (typeof data === "object" && data !== null) {
            id = data.id;
            const dataConfig = definitions.get(data);
            let model = data;
            if (dataConfig) {
              if (dataConfig.model !== Model) {
                throw TypeError("Model instance must match the definition");
              }
            } else {
              model = modelConfig.create(data);
              if (modelConfig.enumerable) {
                id = model.id;
                syncCache(modelConfig, id, model, invalidate);
              }
            }
            if (!modelConfig.enumerable) {
              acc.push(model);
            }
          } else if (!modelConfig.enumerable) {
            throw TypeError(`Model instance must be an object: ${typeof data}`);
          }
          if (modelConfig.enumerable) {
            const key = acc.length;
            Object.defineProperty(acc, key, {
              get() {
                return cache.get(this, key, () => get(Model, id));
              },
              enumerable: true,
            });
          }
          return acc;
        }, []);

        definitions.set(result, config);
        storePointer.set(result, store);

        return Object.freeze(result);
      },
    };

    lists.set(Model, Object.freeze(config));
  }

  return config;
}

function resolveTimestamp(h, v) {
  return v || getCurrentTimestamp();
}

function stringifyId(id) {
  switch (typeof id) {
    case "object":
      return JSON.stringify(
        Object.keys(id)
          .sort()
          .reduce((acc, key) => {
            if (typeof id[key] === "object" && id[key] !== null) {
              throw TypeError(
                `You must use primitive value for '${key}' key: ${typeof id[
                  key
                ]}`,
              );
            }
            acc[key] = id[key];
            return acc;
          }, {}),
      );
    case "undefined":
      return undefined;
    default:
      return String(id);
  }
}

const notFoundErrors = new WeakSet();
function notFoundError(Model, stringId) {
  const err = Error(
    stringifyModel(
      Model,
      `Model instance ${
        stringId !== undefined ? `with '${stringId}' id ` : ""
      }does not exist`,
    ),
  );

  notFoundErrors.add(err);
  return err;
}

function mapError(model, err, suppressLog) {
  if (suppressLog !== false && !notFoundErrors.has(err)) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return setModelState(model, "error", err);
}

function get(Model, id) {
  const config = bootstrap(Model);
  let stringId;

  if (config.enumerable) {
    stringId = stringifyId(id);

    if (!config.list && !stringId) {
      throw TypeError(
        stringifyModel(
          Model,
          `Provided model definition requires non-empty id: "${stringId}"`,
        ),
      );
    }
  } else if (id !== undefined) {
    throw TypeError(
      stringifyModel(Model, "Provided model definition does not support id"),
    );
  }

  const validate = config.storage.validate;
  if (validate) {
    const entry = cache.getEntry(config, stringId);
    if (entry.value && !validate(entry.value)) {
      entry.resolved = false;
      entry.depState = 0;
    }
  }

  const offline = config.storage.offline;

  return cache.get(config, stringId, (h, cachedModel) => {
    if (cachedModel && pending(cachedModel)) return cachedModel;

    let validContexts = true;
    if (config.contexts) {
      config.contexts.forEach(context => {
        if (
          cache.get(context, context, resolveTimestamp) ===
          getCurrentTimestamp()
        ) {
          validContexts = false;
        }
      });
    }

    if (
      validContexts &&
      cachedModel &&
      (config.storage.cache === true || config.storage.validate(cachedModel))
    ) {
      return cachedModel;
    }

    const fallback = () =>
      cachedModel ||
      (offline && config.create(offline.get(stringId))) ||
      config.placeholder(stringId);

    try {
      let result = config.storage.get(id);

      if (typeof result !== "object" || result === null) {
        if (offline) offline.set(stringId, null);
        throw notFoundError(Model, stringId);
      }

      if (result instanceof Promise) {
        result = result
          .then(data => {
            if (typeof data !== "object" || data === null) {
              if (offline) offline.set(stringId, null);
              throw notFoundError(Model, stringId);
            }

            const model = config.create(
              !config.list && stringId ? { ...data, id: stringId } : data,
            );

            if (offline) offline.set(stringId, model);

            return syncCache(config, stringId, setTimestamp(model));
          })
          .catch(e => syncCache(config, stringId, mapError(fallback(), e)));

        return setModelState(fallback(), "pending", result);
      }

      if (cachedModel) definitions.set(cachedModel, null);
      const model = config.create(
        !config.list && stringId ? { ...result, id: stringId } : result,
      );

      if (offline) offline.set(stringId, model);

      return setTimestamp(model);
    } catch (e) {
      return setTimestamp(mapError(fallback(), e));
    }
  });
}

const draftMap = new WeakMap();

function getValidationError(errors) {
  const keys = Object.keys(errors);
  const e = Error(
    `Model validation failed (${keys.join(
      ", ",
    )}) - read the details from 'errors' property`,
  );

  e.errors = errors;

  return e;
}

function set(model, values = {}) {
  let config = definitions.get(model);

  if (config === null) {
    model = stales.get(model);
    config = definitions.get(model);
  }

  if (config === null) {
    throw Error(
      "Provided model instance has expired. Haven't you used stale value?",
    );
  }

  const isInstance = !!config;

  if (!config) config = bootstrap(model);

  const isDraft = draftMap.get(config);

  if (config.nested) {
    throw stringifyModel(
      config.model,
      TypeError(
        "Setting provided nested model instance is not supported, use the root model instance",
      ),
    );
  }

  if (config.list) {
    throw TypeError("Listing model definition does not support 'set' method");
  }

  if (!config.storage.set) {
    throw stringifyModel(
      config.model,
      TypeError(
        "Provided model definition storage does not support 'set' method",
      ),
    );
  }

  if (isInstance) {
    const promise = pending(model);
    if (promise) {
      return promise.then(m => set(m, values));
    }
  }

  let id;
  const setState = (state, value) => {
    if (isInstance) {
      setModelState(model, state, value);
    } else {
      const entry = cache.getEntry(config, id);
      if (entry.value) {
        setModelState(entry.value, state, value);
      }
    }
  };

  try {
    if (
      config.enumerable &&
      !isInstance &&
      (!values || typeof values !== "object")
    ) {
      throw TypeError(`Values must be an object instance: ${values}`);
    }

    if (!isDraft && values && hasOwnProperty.call(values, "id")) {
      throw TypeError(`Values must not contain 'id' property: ${values.id}`);
    }

    const localModel = config.create(values, isInstance ? model : undefined);
    const keys = values ? Object.keys(values) : [];

    const errors = {};
    const lastError = isInstance && isDraft && error(model);

    let hasErrors = false;

    if (localModel) {
      config.checks.forEach((fn, key) => {
        if (keys.indexOf(key) === -1) {
          if (lastError && lastError.errors && lastError.errors[key]) {
            hasErrors = true;
            errors[key] = lastError.errors[key];
          }

          // eslint-disable-next-line eqeqeq
          if (isDraft && localModel[key] == config.model[key]) {
            return;
          }
        }

        let checkResult;
        try {
          checkResult = fn(localModel[key], key, localModel);
        } catch (e) {
          checkResult = e;
        }

        if (checkResult !== true && checkResult !== undefined) {
          hasErrors = true;
          errors[key] = checkResult || true;
        }
      });

      if (hasErrors && !isDraft) {
        throw getValidationError(errors);
      }
    }

    id = localModel ? localModel.id : model.id;

    const result = Promise.resolve(
      config.storage.set(isInstance ? id : undefined, localModel, keys),
    )
      .then(data => {
        const resultModel =
          data === localModel ? localModel : config.create(data);

        if (isInstance && resultModel && id !== resultModel.id) {
          throw TypeError(
            `Local and storage data must have the same id: '${id}', '${resultModel.id}'`,
          );
        }

        let resultId = resultModel ? resultModel.id : id;

        if (hasErrors && isDraft) {
          setModelState(resultModel, "error", getValidationError(errors));
        }

        if (
          isDraft &&
          isInstance &&
          hasOwnProperty.call(data, "id") &&
          (!localModel || localModel.id !== model.id)
        ) {
          resultId = model.id;
        } else if (config.storage.offline) {
          config.storage.offline.set(resultId, resultModel);
        }

        return syncCache(
          config,
          resultId,
          resultModel ||
            mapError(
              config.placeholder(resultId),
              notFoundError(config.model, id),
              false,
            ),
          true,
        );
      })
      .catch(err => {
        err = err !== undefined ? err : Error("Undefined error");
        setState("error", err);
        throw err;
      });

    setState("pending", result);

    return result;
  } catch (e) {
    setState("error", e);
    return Promise.reject(e);
  }
}

function sync(model, values) {
  if (typeof values !== "object") {
    throw TypeError(`Values must be an object instance: ${values}`);
  }

  let config = definitions.get(model);

  if (config === null) {
    model = stales.get(model);
    config = definitions.get(model);
  }

  if (config === null) {
    throw Error(
      "Provided model instance has expired. Haven't you used stale value?",
    );
  }

  if (config === undefined) {
    if (!values) {
      throw TypeError("Values must be defined for usage with model definition");
    }
    config = bootstrap(model);
    model = undefined;
  } else if (values && hasOwnProperty.call(values, "id")) {
    throw TypeError(`Values must not contain 'id' property: ${values.id}`);
  }

  if (config.list) {
    throw TypeError("Listing model definition is not supported in sync method");
  }

  const resultModel = config.create(values, model);
  const id = values ? resultModel.id : model.id;

  return syncCache(
    config,
    id,
    resultModel ||
      mapError(
        config.placeholder(id),
        Error(
          `Model instance ${
            id !== undefined ? ` with '${id}' id` : ""
          }does not exist`,
        ),
        false,
      ),
  );
}

function clear(model, clearValue = true) {
  if (typeof model !== "object" || model === null) {
    throw TypeError(
      `The first argument must be a model instance or a model definition: ${model}`,
    );
  }

  let config = definitions.get(model);

  if (config === null) {
    throw Error(
      "Provided model instance has expired. Haven't you used stale value from the outer scope?",
    );
  }

  if (config) {
    const offline = clearValue && config.storage.offline;
    if (offline) offline.set(model.id, null);

    invalidateTimestamp(model);
    cache.invalidate(config, model.id, { clearValue, deleteEntry: true });
  } else {
    if (!configs.get(model) && !lists.get(model[0])) {
      throw Error(
        "Model definition must be used before - passed argument is probably not a model definition",
      );
    }
    config = bootstrap(model);
    const offline = clearValue && config.storage.offline;

    cache.getEntries(config).forEach(entry => {
      if (offline) offline.set(entry.key, null);
      if (entry.value) invalidateTimestamp(entry.value);
    });
    cache.invalidateAll(config, { clearValue, deleteEntry: true });
  }
}

function pending(...models) {
  let isPending = false;
  const result = models.map(model => {
    try {
      const { state, value } = getModelState(model);
      if (state === "pending") {
        isPending = true;
        return value;
      }
    } catch (e) {} // eslint-disable-line no-empty

    return Promise.resolve(model);
  });

  return isPending && (models.length > 1 ? Promise.all(result) : result[0]);
}

function resolveToLatest(model) {
  model = stales.get(model) || model;

  const promise = pending(model);

  if (!promise) {
    const e = error(model);
    return e ? Promise.reject(e) : Promise.resolve(model);
  }

  return promise.then(m => resolveToLatest(m));
}

function error(model, property) {
  if (model === null || typeof model !== "object") return false;
  const state = getModelState(model);

  if (
    property !== undefined &&
    typeof state.error === "object" &&
    state.error
  ) {
    return state.error.errors && state.error.errors[property];
  }

  return state.error;
}

function ready(...models) {
  return (
    models.length > 0 &&
    models.every(model => {
      const config = definitions.get(model);
      return !!(config && config.isInstance(model));
    })
  );
}

function mapValueWithState(lastValue, nextValue) {
  const result = Object.freeze(
    Object.keys(lastValue).reduce((acc, key) => {
      Object.defineProperty(acc, key, {
        get: () => lastValue[key],
        enumerable: true,
      });
      return acc;
    }, Object.create(lastValue)),
  );

  definitions.set(result, definitions.get(lastValue));
  cache.set(result, "state", () => getModelState(nextValue));

  return result;
}

function getValuesFromModel(model, values) {
  model = { ...model, ...values };
  delete model.id;
  return model;
}

function submit(draft, values = {}) {
  const config = definitions.get(draft);
  if (!config || !draftMap.has(config)) {
    throw TypeError(`Provided model instance is not a draft: ${draft}`);
  }

  if (pending(draft)) {
    throw Error("Model draft in pending state");
  }

  const options = draftMap.get(config);
  let result;

  if (!options.id) {
    result = set(options.model, getValuesFromModel(draft, values));
  } else {
    const model = get(options.model, draft.id);
    result = Promise.resolve(pending(model) || model).then(resolvedModel =>
      set(resolvedModel, getValuesFromModel(draft, values)),
    );
  }

  result = result
    .then(resultModel => {
      setModelState(draft, "ready");
      return set(draft, resultModel).then(() => resultModel);
    })
    .catch(e => {
      setModelState(draft, "error", e);
      return Promise.reject(e);
    });

  setModelState(draft, "pending", result);

  return result;
}

function required(value, key) {
  return !!value || `${key} is required`;
}

function valueWithValidation(
  defaultValue,
  validate = required,
  errorMessage = "",
) {
  switch (typeof defaultValue) {
    case "string":
      // eslint-disable-next-line no-new-wrappers
      defaultValue = new String(defaultValue);
      break;
    case "number":
      // eslint-disable-next-line no-new-wrappers
      defaultValue = new Number(defaultValue);
      break;
    default:
      throw TypeError(
        `Default value must be a string or a number: ${typeof defaultValue}`,
      );
  }

  let fn;
  if (validate instanceof RegExp) {
    fn = value => validate.test(value) || errorMessage;
  } else if (typeof validate === "function") {
    fn = (...args) => {
      const result = validate(...args);
      return result !== true && result !== undefined
        ? result || errorMessage
        : result;
    };
  } else {
    throw TypeError(
      `The second argument must be a RegExp instance or a function: ${typeof validate}`,
    );
  }

  validationMap.set(defaultValue, fn);
  return defaultValue;
}

function store(Model, options = {}) {
  const config = bootstrap(Model);

  if (typeof options !== "object") {
    options = { id: options };
  }

  if (options.id !== undefined && typeof options.id !== "function") {
    const id = options.id;
    options.id = host => host[id];
  }

  if (options.draft) {
    if (config.list) {
      throw TypeError(
        "Draft mode is not supported for listing model definition",
      );
    }

    Model = {
      ...Model,
      [connect]: {
        get(id) {
          const model = get(config.model, id);
          return ready(model) ? model : pending(model);
        },
        set(id, values) {
          return values === null ? { id } : values;
        },
      },
    };

    options.draft = bootstrap(Model);
    draftMap.set(options.draft, { model: config.model, id: options.id });
  }

  const createMode =
    options.draft &&
    ((config.enumerable && !options.id) ||
      (!config.enumerable && config.external));

  const desc = {
    get: (host, lastValue) => {
      if (createMode && !lastValue) {
        const nextValue = options.draft.create({});
        syncCache(options.draft, nextValue.id, nextValue, false);
        return get(Model, nextValue.id);
      }

      const id =
        (options.draft || options.id === undefined) && lastValue
          ? lastValue.id
          : options.id && options.id(host);

      const nextValue = get(Model, id);

      if (lastValue && nextValue !== lastValue && !ready(nextValue)) {
        return mapValueWithState(lastValue, nextValue);
      }

      return nextValue;
    },
    connect: options.draft
      ? (host, key) => () => {
          cache.invalidate(host, key, { clearValue: true });
          clear(Model, false);
        }
      : undefined,
  };

  if (!options.id && !options.draft && (config.enumerable || config.list)) {
    desc.set = (host, values) => {
      const valueConfig = definitions.get(values);
      if (valueConfig) {
        if (valueConfig === config) return values;
        throw TypeError("Model instance must match the definition");
      }
      return store.get(Model, values);
    };
  } else if (!config.list) {
    desc.set = (host, values, lastValue) => {
      if (!lastValue || !ready(lastValue)) lastValue = desc.get(host);

      store.set(lastValue, values).catch(/* istanbul ignore next */ () => {});

      return lastValue;
    };
  }

  return desc;
}

export default Object.assign(store, {
  // storage
  connect,

  // actions
  get,
  set,
  sync,
  clear,

  // guards
  pending,
  error,
  ready,

  // helpers
  submit,
  value: valueWithValidation,
  resolve: resolveToLatest,
  ref,
});

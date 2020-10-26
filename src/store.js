/* eslint-disable no-use-before-define */
import * as cache from "./cache.js";
import { storePointer } from "./utils.js";

/* istanbul ignore next */
try { process.env.NODE_ENV } catch(e) { var process = { env: { NODE_ENV: 'production' } }; } // eslint-disable-line

export const connect = `__store__connect__${Date.now()}__`;
const definitions = new WeakMap();

function resolve(config, model, lastModel) {
  if (lastModel) definitions.set(lastModel, null);
  definitions.set(model, config);

  return model;
}

function resolveWithInvalidate(config, model, lastModel) {
  resolve(config, model, lastModel);

  if ((config.external && model) || !lastModel || error(model)) {
    config.invalidate();
  }

  return model;
}

function sync(config, id, model, invalidate) {
  cache.set(
    config,
    id,
    invalidate ? resolveWithInvalidate : resolve,
    model,
    true,
  );
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

function setupStorage(storage) {
  if (typeof storage === "function") storage = { get: storage };

  const result = { cache: true, ...storage };

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

const stateSetter = (h, v) => v;
function setModelState(model, state, value = model) {
  cache.set(model, "state", stateSetter, { state, value }, true);
  return model;
}

const stateGetter = (model, v = { state: "ready", value: model }) => v;
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

const validationMap = new WeakMap();

function resolveKey(Model, key, config) {
  let defaultValue = config.model[key];
  let type = typeof config.model[key];

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
  return `${msg}:\n\n${JSON.stringify(
    Model,
    (key, value) => {
      if (key === connect) return undefined;
      return value;
    },
    2,
  )}\n\n`;
}

const _ = (h, v) => v;

const resolvedPromise = Promise.resolve();
const configs = new WeakMap();
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
    const placeholder = {};
    const enumerable = hasOwnProperty.call(Model, "id");
    const checks = new Map();

    config = {
      model: Model,
      external: !!storage,
      enumerable,
      nested: !enumerable && nested,
      placeholder: id =>
        Object.freeze(Object.assign(Object.create(placeholder), { id })),
      isInstance: model => Object.getPrototypeOf(model) !== placeholder,
      invalidate: () => {
        if (!invalidatePromise) {
          invalidatePromise = resolvedPromise.then(() => {
            cache.invalidate(config, config, true);
            invalidatePromise = null;
          });
        }
      },
      checks,
    };

    config.storage = setupStorage(storage || memoryStorage(config, Model));

    const transform = Object.keys(Object.freeze(Model))
      .filter(key => key !== connect)
      .map(key => {
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
            if (lastModel) {
              id = lastModel.id;
            } else if (hasOwnProperty.call(data, "id")) {
              id = String(data.id);
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
              Object.defineProperty(model, key, {
                get() {
                  return cache.get(this, key, defaultValue);
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
                const defaultArray = Object.freeze(
                  defaultValue.map(Constructor),
                );
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
                  model[key] = localConfig.create(data[key]);
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
                      sync(nestedConfig, resultModel.id, resultModel);
                    }
                  }
                } else {
                  resultModel = lastModel && lastModel[key];
                }

                if (resultModel) {
                  const id = resultModel.id;
                  Object.defineProperty(model, key, {
                    get() {
                      return cache.get(
                        this,
                        key,
                        pending(this) ? _ : () => get(defaultValue, id),
                      );
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
                model[key] = lastModel
                  ? lastModel[key]
                  : nestedConfig.create({});
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
      }, {});

      definitions.set(model, config);
      storePointer.set(model, store);

      return Object.freeze(model);
    };

    Object.freeze(placeholder);

    configs.set(Model, Object.freeze(config));
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

const lists = new WeakMap();
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
    contexts.add(modelConfig);

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

    config = {
      list: true,
      nested: !modelConfig.enumerable && nested,
      model: Model,
      contexts,
      enumerable: modelConfig.enumerable,
      storage: setupStorage({
        cache: modelConfig.storage.cache,
        get:
          !nested &&
          (id => {
            return modelConfig.storage.list(id);
          }),
      }),
      placeholder: () => Object.freeze(Object.create(listPlaceholderPrototype)),
      isInstance: model =>
        Object.getPrototypeOf(model) !== listPlaceholderPrototype,
      create(items) {
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
                sync(modelConfig, id, model);
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
                return cache.get(
                  this,
                  key,
                  pending(this) ? _ : () => get(Model, id),
                );
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

function mapError(model, err, suppressLog) {
  /* istanbul ignore next */
  if (process.env.NODE_ENV !== "production" && suppressLog !== false) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return setModelState(model, "error", err);
}

function get(Model, id) {
  const config = bootstrap(Model);
  let stringId;

  if (!config.storage.get) {
    throw TypeError(
      stringifyModel(
        Model,
        "Provided model definition does not support 'get' method",
      ),
    );
  }

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

  return cache.get(
    config,
    stringId,
    (h, cachedModel) => {
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

      try {
        let result = config.storage.get(id);

        if (typeof result !== "object" || result === null) {
          throw Error(
            `Model instance ${
              stringId !== undefined ? `with '${stringId}' id` : ""
            } does not exist`,
          );
        }

        if (result instanceof Promise) {
          result = result
            .then(data => {
              if (typeof data !== "object" || data === null) {
                throw Error(
                  `Model instance ${
                    stringId !== undefined ? `with '${stringId}' id` : ""
                  } does not exist`,
                );
              }

              return sync(
                config,
                stringId,
                config.create(stringId ? { ...data, id: stringId } : data),
              );
            })
            .catch(e => {
              return sync(
                config,
                stringId,
                mapError(cachedModel || config.placeholder(stringId), e),
              );
            });

          return setModelState(
            cachedModel || config.placeholder(stringId),
            "pending",
            result,
          );
        }

        if (cachedModel) definitions.set(cachedModel, null);
        return setTimestamp(
          config.create(
            !config.list && stringId ? { ...result, id: stringId } : result,
          ),
        );
      } catch (e) {
        return setTimestamp(
          mapError(cachedModel || config.placeholder(stringId), e),
        );
      }
    },
    config.storage.validate,
  );
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
  const isInstance = !!config;

  if (config === null) {
    throw Error(
      "Provided model instance has expired. Haven't you used stale value?",
    );
  }

  if (!config) config = bootstrap(model);

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

  if (isInstance && pending(model)) {
    throw Error("Provided model instance is in pending state");
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

    if (values && hasOwnProperty.call(values, "id")) {
      throw TypeError(`Values must not contain 'id' property: ${values.id}`);
    }

    const localModel = config.create(values, isInstance ? model : undefined);
    const keys = values ? Object.keys(values) : [];
    const isDraft = draftMap.get(config);
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

        const resultId = resultModel ? resultModel.id : id;

        if (hasErrors && isDraft) {
          setModelState(resultModel, "error", getValidationError(errors));
        }

        return sync(
          config,
          resultId,
          resultModel ||
            mapError(
              config.placeholder(resultId),
              Error(
                `Model instance ${
                  id !== undefined ? `with '${id}' id` : ""
                } does not exist`,
              ),
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

function clear(model, clearValue = true) {
  if (typeof model !== "object" || model === null) {
    throw TypeError(
      `The first argument must be a model instance or a model definition: ${model}`,
    );
  }

  const config = definitions.get(model);

  if (config === null) {
    throw Error(
      "Provided model instance has expired. Haven't you used stale value from the outer scope?",
    );
  }

  if (config) {
    cache.invalidate(config, model.id, clearValue, true);
  } else {
    if (!configs.get(model) && !lists.get(model[0])) {
      throw Error(
        "Model definition must be used before - passed argument is probably not a model definition",
      );
    }
    cache.invalidateAll(bootstrap(model), clearValue, true);
  }
}

function pending(model) {
  if (model === null || typeof model !== "object") return false;
  const { state, value } = getModelState(model);
  return state === "pending" && value;
}

function error(model, property) {
  if (model === null || typeof model !== "object") return false;
  const { state, value } = getModelState(model);
  const result = state === "error" && value;

  if (result && property !== undefined) {
    return result.errors && result.errors[property];
  }

  return result;
}

function ready(model) {
  if (model === null || typeof model !== "object") return false;
  const config = definitions.get(model);
  return !!(config && config.isInstance(model));
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

  const { state, value } = getModelState(nextValue);
  return setModelState(result, state, value);
}

function getValuesFromModel(model) {
  const values = { ...model };
  delete values.id;
  return values;
}

function submit(draft) {
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
    result = store.set(options.model, getValuesFromModel(draft));
  } else {
    const model = store.get(options.model, draft.id);
    result = Promise.resolve(pending(model) || model).then(resolvedModel =>
      store.set(resolvedModel, getValuesFromModel(draft)),
    );
  }

  result = result
    .then(resultModel => {
      setModelState(draft, "ready");
      return store
        .set(draft, getValuesFromModel(resultModel))
        .then(() => resultModel);
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
      [store.connect]: {
        get(id) {
          const model = store.get(config.model, id);
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

  const createMode = options.draft && config.enumerable && !options.id;

  const desc = {
    get: (host, lastValue) => {
      if (createMode && !lastValue) {
        const nextValue = options.draft.create({});
        sync(options.draft, nextValue.id, nextValue);
        return store.get(Model, nextValue.id);
      }

      const id =
        options.draft && lastValue
          ? lastValue.id
          : options.id && options.id(host);

      const nextValue = store.get(Model, id);

      if (lastValue && nextValue !== lastValue && !ready(nextValue)) {
        return mapValueWithState(lastValue, nextValue);
      }

      return nextValue;
    },
    set: config.list
      ? undefined
      : (host, values, lastValue) => {
          if (!lastValue || !ready(lastValue)) lastValue = desc.get(host);

          store
            .set(lastValue, values)
            .catch(/* istanbul ignore next */ () => {});

          return lastValue;
        },
    connect: options.draft ? () => () => clear(Model, false) : undefined,
  };

  return desc;
}

export default Object.assign(store, {
  // storage
  connect,

  // actions
  get,
  set,
  clear,

  // guards
  pending,
  error,
  ready,

  // helpers
  submit,
  value: valueWithValidation,
});

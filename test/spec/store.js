import { define, store } from "../../src/index.js";
import {
  configs as storeConfigs,
  lists as storeLists,
} from "../../src/store.js";
import * as cache from "../../src/cache.js";
import { resolveRaf, resolveTimeout } from "../helpers.js";

fdescribe("store:", () => {
  let Model;

  beforeAll(() => {
    window.env = "production";
  });

  afterAll(() => {
    window.env = "development";
  });

  beforeEach(() => {
    Model = {
      id: true,
      string: "value",
      number: 1,
      bool: false,
      computed: ({ string }) => `This is the string: ${string}`,
      nestedObject: {
        value: "test",
      },
      nestedExternalObject: {
        id: true,
        value: "test",
      },
      nestedArrayOfPrimitives: ["one", "two"],
      nestedArrayOfObjects: [{ one: "two" }],
      nestedArrayOfExternalObjects: [{ id: true, value: "test" }],
    };
  });

  describe("get()", () => {
    it("throws for wrong arguments", () => {
      expect(() => store.get()).toThrow();
    });

    it('throws for model definition with wrongly set "id" key', () => {
      expect(() => store.get({ id: 1 })).toThrow();
    });

    it("throws if property value is not a string, number or boolean", () => {
      expect(() => store.get({ value: undefined })).toThrow();
    });

    it("throws when called with parameters for singleton type", () => {
      expect(() => store.get({}, "1")).toThrow();
    });

    it("throws when called without parameters for enumerable definition", () => {
      expect(() => store.get({ id: true })).toThrow();
    });

    it("throws when property is set as null", () => {
      expect(() => store.get({ value: null })).toThrow();
    });

    it("throws when nested object is used as a primary model", () => {
      store.get(Model, "1");
      expect(() => {
        store.get(Model.nestedObject, "1");
      }).toThrow();
    });

    it("throws when primary model is used as a nested object", () => {
      Model = {};
      store.get(Model);
      expect(() => {
        store.get({ id: true, model: Model }, "1");
      }).toThrow();
    });

    it("throws when nested array is used as a primary model", () => {
      store.get(Model, "1");
      expect(() => store.get(Model.nestedArrayOfObjects)).toThrow();
    });

    it("does not throw when nested array is used as other nested listing", () => {
      store.get(Model, "1");
      expect(() =>
        store.get({
          nestedArrayOfObjects: Model.nestedArrayOfObjects,
        }),
      ).not.toThrow();
    });

    it("returns a placeholder in error state for not defined model", () => {
      const model = store.get({ id: true }, "1");
      expect(model).toBeInstanceOf(Object);
      expect(store.error(model)).toBeInstanceOf(Error);
    });

    it("returns a placeholder in error state with guarded properties", () => {
      const model = store.get({ id: true, testValue: "" }, 1);

      expect(model.id).toBe("1");
      expect(() => model.testValue).toThrow();
      expect(() => model.message).not.toThrow();
    });

    it("returns a placeholder in error state for not found singleton model", () => {
      Model = {
        value: "test",
        [store.connect]: {
          get: () => {},
          set: () => {},
        },
      };

      const model = store.get(Model);
      expect(store.error(model)).toBeInstanceOf(Error);
    });

    it("calls computed property function only once", () => {
      const spy = jasmine.createSpy();
      Model = {
        computed: model => {
          spy(model);
          return "value";
        },
      };

      const model = store.get(Model);
      expect(spy).toHaveBeenCalledTimes(0);
      expect(model.computed).toBe("value");
      expect(spy).toHaveBeenCalledTimes(1);
      expect(model.computed).toBe("value");
      expect(spy).toHaveBeenCalledTimes(1);
    });

    describe("for singleton", () => {
      beforeEach(() => {
        Model = {
          value: "test",
          nested: { value: "test", other: { value: "test" } },
        };
      });

      it("returns default model for singleton", () => {
        expect(store.get(Model)).toEqual({
          value: "test",
          nested: { value: "test", other: { value: "test" } },
        });
      });

      it("reset values by setting null", () => {
        const model = store.get(Model);
        store
          .set(model, {
            value: "other value",
            nested: { value: "other value", other: { value: "great" } },
          })
          .then(nextModel => {
            expect(nextModel.value).toBe("other value");
            expect(nextModel.nested).toEqual({
              value: "other value",
              other: { value: "great" },
            });
            store.set(nextModel, null).then(targetModel => {
              expect(targetModel.value).toBe("test");
              expect(targetModel.nested).toEqual(Model.nested);
            });
          });
      });
    });

    describe("for created instance", () => {
      let promise;
      beforeEach(() => {
        promise = store.set(Model, {});
      });

      it("returns default values", done =>
        promise
          .then(model => {
            expect(model).toEqual({
              id: model.id,
              string: "value",
              number: 1,
              bool: false,
              nestedObject: {
                value: "test",
              },
              nestedExternalObject: undefined,
              nestedArrayOfPrimitives: ["one", "two"],
              nestedArrayOfObjects: [{ one: "two" }],
              nestedArrayOfExternalObjects: [],
            });
            expect(model.computed).toEqual("This is the string: value");
          })
          .then(done));

      it("returns cached model", done =>
        promise.then(model => {
          expect(store.get(Model, model.id)).toBe(model);
          done();
        }));
    });

    describe("for listing models", () => {
      let promise;
      beforeEach(() => {
        Model = { id: true, value: "" };
        promise = Promise.all([
          store.set(Model, { value: "one" }),
          store.set(Model, { value: "two" }),
        ]);
      });

      it("throws an error for singleton definition (without 'id' key)", () => {
        expect(() => store.get([{}])).toThrow();
      });

      it("throws an error for nested parameters", () => {
        expect(() =>
          store.get([Model], { id: "", other: { value: "test" } }),
        ).toThrow();
      });

      it("returns a placeholder in error state when called with parameters", () => {
        expect(store.error(store.get([Model], { a: "b" }))).toBeInstanceOf(
          Error,
        );
      });

      it("returns a placeholder in error state with guarded properties", () => {
        const model = store.get([Model], { a: "b" });

        expect(() => model.map).toThrow();
        expect(() => model.message).not.toThrow();
      });

      it("returns an array with updated models", done => {
        expect(store.get([Model])).toEqual([]);

        promise
          .then(() => {
            expect(store.get([Model])).toEqual([
              jasmine.objectContaining({ value: "one" }),
              jasmine.objectContaining({ value: "two" }),
            ]);
          })
          .then(done);
      });

      it("returns the same array", () => {
        expect(store.get([Model])).toBe(store.get([Model]));
      });

      it("returns an array without deleted model", done =>
        promise
          .then(([model]) => store.set(model, null))
          .then(() => {
            const list = store.get([Model]);
            expect(list).toEqual([jasmine.objectContaining({ value: "two" })]);
          })
          .then(done));

      it("returns the same array when loose option is set to false", done => {
        Model = {
          id: true,
          value: "",
          [store.connect]: {
            loose: false,
            set: (id, values) => values,
            list: () => [{ id: 1, value: "test" }],
          },
        };

        const list = store.get([Model]);
        store
          .set(list[0], { value: "other" })
          .then(() => {
            const newList = store.get([Model]);
            expect(list).toBe(newList);
            expect(newList[0]).toEqual({ id: "1", value: "other" });
          })
          .then(done);
      });
    });
  });

  describe("set()", () => {
    let promise;
    beforeEach(() => {
      promise = store.set(Model);
    });

    it("throws when set method is not supported", () => {
      expect(() =>
        store.set({ value: "", [store.connect]: { get: () => ({}) } }),
      ).toThrow();
    });

    it("throws when model has expired", done => {
      promise
        .then(model =>
          store.set(model, { string: "" }).then(newModel => {
            store.set(newModel, { string: "other" }).then(() => {
              expect(() => store.set(model, { string: "" })).toThrow();
            });
          }),
        )
        .then(done);
    });

    it("throws when list model definition is used", () => {
      expect(() =>
        store.set([{ id: true, value: "" }], { value: "test" }),
      ).toThrow();
    });

    it("throws when list model instance is used", () => {
      const model = store.get([{ id: true, value: "" }]);
      expect(() => store.set(model, { value: "test" })).toThrow();
    });

    it("throws when updates a nested object directly", done => {
      promise
        .then(model => {
          expect(() => {
            store.set(model.nestedObject, {});
          }).toThrow();
        })
        .then(done);
    });

    it("rejects an error when values are not an object or null", done =>
      store
        .set(Model, false)
        .catch(e => expect(e).toBeInstanceOf(Error))
        .then(done));

    it("rejects an error when model definition is used with null", done =>
      store
        .set(Model, null)
        .catch(e => expect(e).toBeInstanceOf(Error))
        .then(done));

    it("rejects an error when model instance is used with not an object", done =>
      promise
        .then(model => store.set(model, false))
        .catch(e => expect(e).toBeInstanceOf(Error))
        .then(done));

    it("rejects an error when values contain 'id' property", done =>
      promise
        .then(model => store.set(model, model))
        .catch(e => expect(e).toBeInstanceOf(Error))
        .then(done));

    it("rejects an error when array with primitives is set with wrong type", done => {
      promise
        .then(model => {
          store
            .set(model, {
              nestedArrayOfPrimitives: "test",
            })
            .catch(() => {});
        })
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
        })
        .then(done);
    });

    it("rejects an error when array with objects is set with wrong type", done => {
      promise
        .then(model =>
          store.set(model, {
            nestedArrayOfObjects: "test",
          }),
        )
        .catch(e => expect(e).toBeInstanceOf(Error))
        .then(done);
    });

    it("rejects an error when array with external objects is set with wrong type", done => {
      promise
        .then(model =>
          store.set(model, {
            nestedArrayOfExternalObjects: "test",
          }),
        )
        .catch(e => expect(e).toBeInstanceOf(Error))
        .then(done);
    });

    it("rejects an error when array with nested objects are set with wrong type", done => {
      promise
        .then(model =>
          store.set(model, {
            nestedArrayOfObjects: [{}, "test"],
          }),
        )
        .catch(e => expect(e).toBeInstanceOf(Error))
        .then(done);
    });

    it("returns a placeholder in error state for not found singleton model", done => {
      Model = {
        value: "test",
        [store.connect]: {
          get: () => {},
          set: (id, values) => values,
        },
      };

      store
        .set(Model, null)
        .then(model => {
          expect(store.error(model)).toBeInstanceOf(Error);
        })
        .then(done);
    });

    it('creates uuid for objects with "id" key', done =>
      store
        .set(Model, { nestedArrayOfObjects: [{}] })
        .then(model => {
          expect(model.id).toBeDefined();
          expect(model.nestedObject.id).not.toBeDefined();
          expect(model.nestedArrayOfObjects[0].id).not.toBeDefined();
        })
        .then(done));

    it("updates single property", done =>
      promise
        .then(model =>
          store.set(model, { string: "new value" }).then(newModel => {
            expect(newModel.string).toBe("new value");
            expect(newModel.number).toBe(1);
            expect(newModel.bool).toBe(false);
            expect(newModel.nestedObject).toBe(model.nestedObject);
            expect(newModel.nestedArrayOfObjects).toBe(
              newModel.nestedArrayOfObjects,
            );
            expect(newModel.nestedArrayOfPrimitives).toBe(
              newModel.nestedArrayOfPrimitives,
            );
          }),
        )
        .then(done));

    it("updates string value to empty string from null and undefined", done => {
      Model = {
        one: "one",
        two: "two",
      };

      const model = store.get(Model);
      store
        .set(model, { one: null, two: undefined })
        .then(newModel => {
          expect(newModel).toEqual({ one: "", two: "" });
        })
        .then(done);
    });

    it("updates nested object", done =>
      promise.then(model =>
        store
          .set(model, { nestedObject: { value: "other" } })
          .then(newModel => {
            expect(newModel.nestedObject).toEqual({ value: "other" });
            done();
          }),
      ));

    it("rejects an error when updates nested object with different model", done =>
      promise.then(model =>
        store
          .set({ test: "value" })
          .then(otherModel =>
            store.set(model, { nestedExternalObject: otherModel }),
          )
          .catch(e => e)
          .then(e => expect(e).toBeInstanceOf(Error))
          .then(done),
      ));

    it("updates nested external object with proper model", done =>
      promise.then(model =>
        store.set(Model.nestedExternalObject, {}).then(newExternal =>
          store
            .set(model, { nestedExternalObject: newExternal })
            .then(newModel => {
              expect(newModel).not.toBe(model);
              expect(newModel.nestedExternalObject).toBe(newExternal);
              done();
            }),
        ),
      ));

    it("updates nested external object with data", done =>
      promise.then(model =>
        store
          .set(model, { nestedExternalObject: { value: "one", a: "b" } })
          .then(newModel => {
            expect(newModel).not.toBe(model);
            expect(newModel.nestedExternalObject).toEqual({
              id: newModel.nestedExternalObject.id,
              value: "one",
            });
            done();
          }),
      ));

    it("updates nested external object with model id", done =>
      promise.then(model =>
        store.set(Model.nestedExternalObject, {}).then(newExternal =>
          store
            .set(model, { nestedExternalObject: newExternal.id })
            .then(newModel => {
              expect(newModel).not.toBe(model);
              expect(newModel.nestedExternalObject).toBe(newExternal);
              done();
            }),
        ),
      ));

    it("clears nested external object", done =>
      promise.then(model =>
        store
          .set(model, { nestedExternalObject: null })
          .then(newModel => {
            expect(newModel).not.toBe(model);
            expect(newModel.nestedExternalObject).toBe(undefined);
          })
          .then(done),
      ));

    it("updates nested array of primitives", done =>
      promise.then(model =>
        store
          .set(model, { nestedArrayOfPrimitives: [1, 2, 3] })
          .then(newModel => {
            expect(newModel.nestedArrayOfPrimitives).toEqual(["1", "2", "3"]);
            done();
          }),
      ));

    it("create model with nested array of objects", done => {
      store
        .set(Model, {
          nestedArrayOfObjects: [{ one: "two" }, { two: "three", one: "four" }],
        })
        .then(model => {
          expect(model.nestedArrayOfObjects).toEqual([
            { one: "two" },
            { one: "four" },
          ]);
          done();
        });
    });

    it("updates nested array of objects", done =>
      promise.then(model =>
        store
          .set(model, { nestedArrayOfObjects: [{ one: "three" }] })
          .then(newModel => {
            expect(newModel.nestedArrayOfObjects).toEqual([{ one: "three" }]);
            done();
          }),
      ));

    it("rejects an error when model in nested array does not match model", done => {
      store
        .set({ myValue: "text" })
        .then(model =>
          store.set(Model, {
            nestedArrayOfExternalObjects: [model],
          }),
        )
        .catch(e => e)
        .then(e => expect(e).toBeInstanceOf(Error))
        .then(done);
    });

    it("creates model with nested external object from raw data", done => {
      store
        .set(Model, {
          nestedArrayOfExternalObjects: [{ id: "1", value: "1" }],
        })
        .then(model => {
          expect(model.nestedArrayOfExternalObjects[0].id).toEqual("1");
          expect(model.nestedArrayOfExternalObjects).toEqual([
            { id: "1", value: "1" },
          ]);
          done();
        });
    });

    it("creates model with nested external object from model instance", done => {
      store.set(Model.nestedArrayOfExternalObjects[0]).then(nestedModel =>
        store
          .set(Model, {
            nestedArrayOfExternalObjects: [nestedModel],
          })
          .then(model => {
            expect(model.nestedArrayOfExternalObjects[0]).toBe(nestedModel);
            done();
          }),
      );
    });

    it("updates in schedule on pending model instance", done => {
      promise
        .then(model => {
          store.set(model, { string: "a" }).then(m => {
            expect(m.string).toBe("a");
          });
          store.set(model, { string: "b" }).then(m => {
            expect(m.string).toBe("b");
          });
          return store.set(model, { string: "c" }).then(m => {
            expect(m.string).toBe("c");
          });
        })
        .then(done);
    });

    it("updates singleton model by the model definition reference", () => {
      Model = { value: "test" };
      const model = store.get(Model);

      store.set(Model, { value: "new value" });
      store.pending(model).then(nextModel => {
        expect(nextModel).toBe(store.get(Model));
      });
    });

    it("deletes model", done =>
      promise.then(model =>
        store.set(model, null).then(() => {
          const currentModel = store.get(Model, model.id);
          expect(currentModel).toBeInstanceOf(Object);
          expect(store.error(currentModel)).toBeInstanceOf(Error);
          done();
        }),
      ));

    it("updates model using stale instance", done => {
      promise.then(model => {
        store.set(model, { string: "test" }).then(() => {
          store.set(model, { string: "other" }).then(finalModel => {
            expect(finalModel.string).toBe("other");
            done();
          });
        });
      });
    });
  });

  describe("sync()", () => {
    let promise;
    beforeEach(() => {
      promise = store.set(Model, { string: "test" });
    });

    describe("for model instance", () => {
      it("throws for wrong values", done => {
        promise
          .then(model => {
            expect(() => store.sync(model, undefined)).toThrow();
            expect(() => store.sync(model, { id: 123 })).toThrow();
          })
          .then(done);
      });

      it("throws for syncing deep stale model instance", done => {
        promise
          .then(model => {
            store.sync(model, { string: "other" });
            store.sync(model, { string: "two" });
            expect(() => store.sync(model, { string: "three" })).toThrow();
          })
          .then(done);
      });

      it("updates memory cache of the model instance synchronously", done => {
        promise
          .then(model => {
            const nextModel = store.sync(model, { string: "other" });
            expect(store.get(Model, nextModel.id).string).toBe("other");
            expect(store.ready(model)).toBe(false);
          })
          .then(done);
      });

      it("updates stale model instance", done => {
        promise
          .then(model => {
            const nextModel = store.sync(model, { string: "other" });
            store.sync(model, { string: "two" });
            expect(store.get(Model, model.id).string).toBe("two");
            expect(store.ready(nextModel)).toBe(false);
          })
          .then(done);
      });

      it("deletes model instance", done => {
        promise
          .then(model => {
            const nextModel = store.sync(model, null);
            expect(store.error(nextModel)).toBeInstanceOf(Error);
          })
          .then(done);
      });

      it("deletes singleton model instance", () => {
        Model = { value: "test" };
        const model = store.get(Model);
        store.sync(model, null);
        const nextModel = store.get(Model);
        expect(store.error(nextModel)).toBeInstanceOf(Error);
      });
    });

    describe("for model definition", () => {
      beforeEach(() => {
        Model = {
          id: true,
          value: "test",
        };
      });

      it("throws when values are not an object instance", () => {
        expect(() => store.sync(Model, null)).toThrow();
      });

      it("throws for listing model definition", () => {
        expect(() => store.sync([Model], {})).toThrow();
      });

      it("creates new instance", () => {
        const model = store.sync(Model, {});
        expect(model.value).toBe("test");
      });

      it("creates new instance with external id", () => {
        const model = store.sync(Model, { id: 1 });
        expect(model.id).toBe("1");
      });
    });
  });

  describe("clear()", () => {
    let promise;
    beforeEach(() => {
      promise = store.set(Model, { string: "test" });
    });

    it("throws when clear not a model instance or model definition", () => {
      expect(() => store.clear()).toThrow();
      expect(() => store.clear("string")).toThrow();
    });

    it("throws when first argument is error not connected to model instance", () => {
      expect(() => store.clear(Error("Some error"))).toThrow();
    });

    it("throws when model has expired", done => {
      promise
        .then(model =>
          store.set(model, { string: "other" }).then(() => {
            expect(() => store.clear(model)).toThrow();
          }),
        )
        .then(done);
    });

    it("removes model instance by reference", done => {
      promise
        .then(model => {
          store.clear(model);
          expect(store.error(store.get(Model, model.id))).toBeInstanceOf(Error);
        })
        .then(done);
    });

    it("removes model instance by id", done => {
      promise
        .then(model => {
          store.clear(Model, model.id);
          expect(store.error(store.get(Model, model.id))).toBeInstanceOf(Error);
        })
        .then(done);
    });

    it("removes all model instances by definition", done => {
      promise
        .then(model => {
          store.clear(Model);
          expect(store.error(store.get(Model, model.id))).toBeInstanceOf(Error);
        })
        .then(done);
    });

    it("only invalidates with clearValue option set to false", done => {
      const spy = jasmine.createSpy();
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          cache: 1000 * 60,
          get: () => {
            spy();
            return Promise.resolve().then(() => ({ value: "test" }));
          },
          list: () => [{ id: 1, value: "test" }],
        },
      };

      const model = store.get(Model, 1);
      expect(spy).toHaveBeenCalledTimes(1);

      store
        .pending(model)
        .then(resolvedModel => {
          store.clear(resolvedModel, false);
          const pendingModel = store.get(Model, 1);
          expect(spy).toHaveBeenCalledTimes(2);
          expect(pendingModel).toBe(resolvedModel);
        })
        .then(done);
    });

    it("only invalidates with clearValue option set to false", () => {
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          cache: 1000 * 60 * 5,
          list: () => [{ id: 1, value: "test" }],
        },
      };

      const list = store.get([Model]);

      return resolveRaf(() => {
        store.clear([Model], false);
        const clearList = store.get([Model]);
        expect(list).not.toBe(clearList);
        expect(clearList.length).toBe(1);
      });
    });
  });

  describe("value()", () => {
    it("throws when value is not a string or a number", () => {
      expect(() => store.value(null)).toThrow();
    });

    it("throws when validate function has wrong type", () => {
      expect(() => store.value("", null)).toThrow();
    });

    it("throws when string instance is directly used", () => {
      // eslint-disable-next-line no-new-wrappers
      Model = { some: new String("") };
      expect(() => store.get(Model)).toThrow();
    });

    it("requires not empty string for new model", done => {
      Model = { id: true, value: store.value("test") };

      store
        .set(Model, { value: "" })
        .catch(e => {
          expect(e.errors.value).toBeDefined();
        })
        .then(done);
    });

    it("requires not empty string for updated model", done => {
      Model = { id: true, value: store.value("test") };

      store
        .set(Model, {})
        .then(model =>
          store.set(model, { value: "" }).catch(e => {
            expect(e.errors.value).toBeDefined();
            expect(store.error(model)).toBe(e);
          }),
        )
        .then(done);
    });

    it("requires non-zero value for new model", done => {
      Model = { id: true, value: store.value(100) };

      store
        .set(Model, { value: 0 })
        .catch(e => {
          expect(e.errors.value).toBeDefined();
        })
        .then(done);
    });

    it("requires non-zero value for updated model", done => {
      Model = { id: true, value: store.value(100) };

      store
        .set(Model, {})
        .then(model =>
          store.set(model, { value: 0 }).catch(e => {
            expect(e.errors.value).toBeDefined();
            expect(store.error(model)).toBe(e);
          }),
        )
        .then(done);
    });

    it("uses custom validation function", done => {
      Model = {
        id: true,
        value: store.value("", v => v !== "test", "custom message"),
      };

      store
        .set(Model, { value: "test" })
        .catch(e => {
          expect(e.errors.value).toBe("custom message");
        })
        .then(done);
    });

    it("uses a regexp as a validation function", done => {
      Model = {
        id: true,
        value: store.value("", /[a-z]+/, "custom message"),
      };

      store
        .set(Model, { value: "123" })
        .catch(e => {
          expect(e.errors.value).toBe("custom message");
        })
        .then(done);
    });

    it("allows throwing an error in validation function", done => {
      Model = {
        id: true,
        value: store.value("", v => {
          if (v === "test") throw Error("Some error");
        }),
      };

      store
        .set(Model, { value: "test" })
        .catch(e => {
          expect(e.errors.value).toBeInstanceOf(Error);
        })
        .then(done);
    });

    it("allows returning false value in validation function", done => {
      Model = {
        id: true,
        value: store.value("", v => {
          if (v === "test") return false;
          return true;
        }),
      };

      store
        .set(Model, { value: "test" })
        .catch(e => {
          expect(e.errors.value).toBe(true);
        })
        .then(done);
    });

    it("for a draft it aggregates errors when updating properties one by one", done => {
      Model = {
        id: true,
        one: store.value("one"),
        two: store.value("two"),
      };

      const desc = store(Model, { draft: true });
      const host = {};
      const model = desc.value(host);

      store
        .set(model, { one: "" })
        .then(nextModel => {
          const error = store.error(nextModel);
          expect(error).toBeDefined();
          expect(error.errors.one).toBeDefined();

          return store.set(nextModel, { two: "" });
        })
        .then(nextModel => {
          const error = store.error(nextModel);
          expect(error).toBeDefined();
          expect(error.errors.one).toBeDefined();
          expect(error.errors.two).toBeDefined();
        })
        .then(done);
    });

    it("for a draft it allows default value, which does not pass validation", done => {
      Model = { id: true, value: store.value(""), number: store.value(100) };

      const desc = store(Model, { draft: true });
      const host = {};
      const model = desc.value(host);

      store
        .set(model, { number: 0 })
        .then(nextModel => {
          const error = store.error(nextModel);
          expect(error.errors.value).not.toBeDefined();
        })
        .then(done);
    });
  });

  describe("ref()", () => {
    it("throws when the first argument is not a function", () => {
      expect(() => store.ref()).toThrow();
    });

    it("resolves to the result of the function", () => {
      Model = {
        id: true,
        value: "",
        model: store.ref(() => Model),
      };

      store.set(Model, { value: "a", model: { value: "b" } }).then(model => {
        expect(model.value).toBe("a");
        expect(model.model.value).toBe("b");
      });
    });
  });

  describe("guards", () => {
    it("returns false if value is not an object instance", () => {
      expect(store.pending(null)).toBe(false);
      expect(store.error(null)).toBe(false);
      expect(store.ready(null)).toBe(false);
      expect(store.pending()).toBe(false);
      expect(store.error()).toBe(false);
      expect(store.ready()).toBe(false);
      expect(store.ready(123)).toBe(false);
    });

    it("ready() returns truth for ready model instance", done => {
      Model = { id: true };
      store
        .set(Model)
        .then(model => {
          expect(store.ready(model)).toBe(true);
        })
        .then(done);
    });

    it("ready() returns false if one of the argument is not resolved model instance", done => {
      Model = { id: true };
      store
        .set(Model)
        .then(model => {
          expect(store.ready(model, null)).toBe(false);
        })
        .then(done);
    });

    it("pending() returns a promise for a list of pending models", done => {
      Model = {
        id: true,
        value: "",
        [store.connect]: id => Promise.resolve({ id, value: "test" }),
      };

      store
        .pending(store.get(Model, "1"), store.get(Model, "2"))
        .then(([a, b]) => {
          expect(a).toEqual({ id: "1", value: "test" });
          expect(b).toEqual({ id: "2", value: "test" });

          return store.pending(a, store.get(Model, "3")).then(([c, d]) => {
            expect(c).toBe(a);
            expect(d).toEqual({ id: "3", value: "test" });
          });
        })
        .then(done);
    });

    it("ready() returns truth for ready a list of models", () => {
      Model = { id: true };
      const list = store.get([Model]);
      expect(store.ready(list)).toBe(true);
    });

    it("error() returns validation message", done => {
      Model = { id: true, value: store.value("test") };

      store
        .set(Model, {})
        .then(model => {
          store.set(model, { value: "" }).catch(() => {});
          expect(store.error(model, "value")).toBe("value is required");
        })
        .then(done);
    });

    it("error() is truthy for pending model after error", () => {
      Model = {
        value: "",
        [store.connect]: {
          get: () => {
            throw Error("Some error");
          },
          set: (id, values) => values,
        },
      };

      const model = store.get(Model);
      expect(store.error(model)).toBeInstanceOf(Error);
      store.set(Model, {});
      const pendingModel = store.get(Model);

      expect(store.pending(pendingModel)).toBeInstanceOf(Promise);
      expect(store.error(pendingModel)).toBeInstanceOf(Error);

      return store.pending(pendingModel).then(newModel => {
        expect(store.pending(newModel)).toBe(false);
        expect(store.error(newModel)).toBe(false);
        expect(store.ready(newModel)).toBe(true);
      });
    });

    it("resolve() returns the latest model instance", done => {
      store
        .set(Model)
        .then(model =>
          store.resolve(model).then(m => {
            expect(m).toBe(model);

            store.set(m, { string: "my value" });
            store.set(m, { string: "latest value" });
            return store.resolve(m).then(nm => {
              expect(nm).not.toBe(m);
              expect(nm.string).toBe("latest value");
            });
          }),
        )
        .then(done);
    });

    it("resolve() rejects an error from the model instance", done => {
      const model = store.get(Model, "test");
      store
        .resolve(model)
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
        })
        .then(done);
    });
  });

  describe("factory", () => {
    let el;

    afterEach(() => {
      if (el && el.parentElement) document.body.removeChild(el);
      return resolveRaf(() => {});
    });

    describe("for enumerable model", () => {
      beforeEach(() => {
        let idCount = 2;
        Model = {
          id: true,
          value: "test",
          [store.connect]: {
            get: id => Promise.resolve({ id, value: "test" }),
            set: (id, values) => ({ ...values, id: id || idCount++ }), // eslint-disable-line no-plusplus
          },
        };

        define({
          tag: "test-store-factory-enumerable",
          modelId: "1",
          byprop: store(Model, "modelId"),
          byfn: store(Model, ({ modelId }) => modelId),
          withoutid: store(Model),
          draft: store(Model, { draft: true, id: "modelId" }),
          draftwithoutid: store(Model, { draft: true }),
        });

        el = document.createElement("test-store-factory-enumerable");
        document.body.appendChild(el);

        return resolveRaf(() => {});
      });

      describe("with id", () => {
        it("throws when try to set value by assertion", () => {
          expect(() => {
            el.byprop = "1";
          }).toThrow();
        });

        it("gets and updates store model instance", () => {
          let pendingModel = el.byprop;
          expect(store.pending(pendingModel)).toBeTruthy();
          return store.pending(pendingModel).then(resultModel => {
            expect(el.byprop).toBe(resultModel);
            expect(el.byfn).toBe(resultModel);

            store.set(resultModel, { value: "new value" });

            pendingModel = el.byprop;
            expect(store.pending(pendingModel)).toBeTruthy();

            return store.pending(pendingModel).then(anotherResultModel => {
              expect(el.byprop).toBe(anotherResultModel);
              expect(el.byfn).toBe(anotherResultModel);
            });
          });
        });

        describe("in draft mode", () => {
          it("throws when try to set value by assertion", () => {
            expect(() => {
              el.draft = "1";
            }).toThrow();
          });

          it("has global space for draft definitions", () => {
            const anotherEl = document.createElement(
              "test-store-factory-enumerable",
            );
            expect(el.draft).toBe(anotherEl.draft);
          });

          it("returns a draft of the original model", () => {
            const pendingModel = el.draft;
            expect(store.pending(pendingModel)).toBeTruthy();
            return store.pending(pendingModel).then(() => {
              expect(el.draft).not.toBe(store.get(Model, el.modelId));
            });
          });

          it("returns the first draft of the original model after model changes", () =>
            store.pending(el.draft).then(model =>
              store.set(model, { value: "new value" }).then(() => {
                expect(el.draft.value).toBe("new value");
                expect(store.get(Model, el.modelId).value).toBe("test");
              }),
            ));

          it("throws when submit not a draft", () =>
            store.pending(store.get(Model, "1")).then(model => {
              expect(() => store.submit(model)).toThrow();
            }));

          it("throws when submits draft model instance in pending state", () => {
            expect(() => store.submit(el.draft)).toThrow();
          });

          it("submits changes from draft to the original model", () =>
            store
              .pending(el.draft)
              .then(model => store.set(model, { value: "new value" }))
              .then(() => store.submit(el.draft))
              .then(() => {
                expect(el.draft.value).toBe("new value");
                expect(store.get(Model, el.modelId).value).toBe("new value");
              }));

          it("clears draft cache when disconnected", () =>
            store
              .pending(el.draft)
              .then(model => store.set(model, { string: "new value" }))
              .then(() => {
                document.body.removeChild(el);

                return resolveTimeout(() => {
                  document.body.appendChild(el);
                  expect(el.draft.value).toBe("test");
                });
              }));
        });
      });

      describe("without id", () => {
        it("returns null when get before setting an id", () => {
          expect(el.withoutid).toBe(null);
        });

        it("set id by model by reference from different definition", () => {
          const model = store.get({ id: true }, "1");
          el.withoutid = model;
          expect(el.withoutid.id).toBe("1");
        });

        it("set model id from the attribute value", () => {
          el.setAttribute("withoutid", "2");
          expect(el.withoutid).toBe(store.get(Model, "2"));
        });

        it("set model id by assertion", () => {
          el.withoutid = 2;
          expect(el.withoutid).toBe(store.get(Model, "2"));
        });

        it("set model by reference", () => {
          const model = store.get(Model, "1");
          el.withoutid = model;
          expect(el.withoutid).toBe(model);
        });

        it("returns updated model", () => {
          const model = store.get(Model, "1");
          el.withoutid = model;
          return store
            .pending(model)
            .then(resultModel => store.set(resultModel, { value: "new value" }))
            .then(() => {
              expect(el.withoutid.value).toBe("new value");
            });
        });

        it("clears reference by property assertion", () => {
          const model = store.get(Model, "1");
          el.withoutid = model;
          el.withoutid = null;
          expect(el.withoutid).toBe(null);
        });

        describe("in draft mode", () => {
          it("returns new model instance for not initialized model", () => {
            expect(el.draftwithoutid).toBeDefined();
            expect(store.ready(el.draftwithoutid)).toBe(true);
          });

          it("updates not initialized draft new model instance", () =>
            store
              .set(el.draftwithoutid, { value: "new value" })
              .then(targetModel => {
                expect(el.draftwithoutid).toBe(targetModel);
                expect(targetModel.value).toBe("new value");
              }));

          it("submits new model and updates values to resolved model", () =>
            store.submit(el.draftwithoutid).then(resultModel => {
              expect(resultModel.id).toBe("2");
              expect(el.draftwithoutid).toEqual(resultModel);

              el.draftwithoutid = null;
              expect(el.draftwithoutid).not.toEqual(resultModel);
              return store.submit(el.draftwithoutid).then(otherModel => {
                expect(otherModel.id).toBe("3");
              });
            }));

          it("reset draft values by store set method", () =>
            store
              .set(el.draftwithoutid, { value: "new value" })
              .then(() => store.set(el.draftwithoutid, null))
              .then(() => {
                expect(el.draftwithoutid.value).toBe("test");
              }));
        });
      });
    });

    describe("for singleton model", () => {
      beforeEach(() => {
        Model = { value: "test" };

        define({
          tag: "test-store-factory-singleton",
          model: store(Model),
          draft: store(Model, { draft: true }),
        });
        el = document.createElement("test-store-factory-singleton");
        document.body.appendChild(el);
      });

      it("throws when id is set for singleton definition", () => {
        expect(() => {
          store(Model, "modelId");
        }).toThrow();
        expect(() => {
          store(Model, () => "modelId");
        }).toThrow();
        expect(() => {
          store(Model, { id: "modelId" });
        }).toThrow();
      });

      it("returns model and updated model", () => {
        expect(el.model).toEqual({ value: "test" });

        return store.set(Model, { value: "new value" }).then(() => {
          expect(el.model).toEqual({ value: "new value" });
        });
      });

      it("in draft mode uses default values for external storage", () => {
        Model = {
          value: "test",
          [store.connect]: {
            get: () => {},
            set: (id, values) => values,
          },
        };

        const desc = store(Model, { draft: true });
        expect(desc.value({})).toEqual({ value: "test" });
      });
    });

    describe("for listing model", () => {
      beforeEach(() => {
        Model = {
          id: true,
          value: "test",
          [store.connect]: {
            list: id => (id === "default" ? [{ id: "1" }, { id: "2" }] : []),
          },
        };

        define({
          tag: "test-store-factory-listing",
          listwithid: store([Model], () => "default"),
          listwithoutid: store([Model]),
        });
        el = document.createElement("test-store-factory-listing");
        document.body.appendChild(el);
      });

      it("set id by assertion when no id option is set", () => {
        expect(el.listwithoutid).toBe(null);
        el.listwithoutid = "some";
        expect(el.listwithoutid).toEqual([]);
        el.listwithoutid = "default";
        expect(el.listwithoutid.length).toBe(2);
      });

      it("throws when try to update property with id option", () => {
        expect(() => {
          el.listwithid = "another";
        }).toThrow();
      });

      it("throws for the draft mode", () => {
        expect(() => store([Model], { draft: true })).toThrow();
      });
    });

    describe("connected to async storage", () => {
      let mode;

      beforeEach(() => {
        const storage = {
          1: { value: "one" },
          2: { value: "two" },
        };
        Model = {
          id: true,
          value: "test",
          [store.connect]: {
            get: id => Promise[mode]().then(() => storage[id]),
            set: (id, values) => Promise[mode]().then(() => values),
          },
        };

        define({
          tag: "test-store-factory-async",
          modelId: "1",
          model: store(Model, "modelId"),
          draft: store(Model, { draft: true, id: "modelId" }),
        });

        mode = "resolve";
        el = document.createElement("test-store-factory-async");
        document.body.appendChild(el);
      });

      it("returns pending placeholder with prototype to model", () =>
        store
          .pending(el.model)
          .then(model => {
            expect(el.model).toBe(model);
            el.modelId = "2";
            expect(el.model).not.toBe(model);
            expect(el.model.id).toBe("1");
            expect(store.pending(el.model)).toBeTruthy();

            return store.pending(el.model);
          })
          .then(model => {
            expect(model.id).toBe("2");
            expect(el.model).toBe(model);
          }));

      describe("for draft mode", () => {
        it("always returns the first draft of the original model", () =>
          store
            .pending(store.get(Model, "1"))
            .then(model => {
              expect(el.draft.value).toBe("one");
              return store.set(model, { value: "other" });
            })
            .then(() => {
              expect(el.draft.value).toBe("one");
            }));

        it("sets error state when submit fails", () =>
          store.pending(el.draft).then(draftModel => {
            mode = "reject";
            return store.submit(draftModel).catch(error => {
              expect(store.error(draftModel)).toBe(error);
            });
          }));
      });
    });
  });

  describe("connected to sync storage", () => {
    let storage;
    let maxId;
    beforeEach(() => {
      maxId = 2;
      storage = {
        1: { id: "1", value: "test" },
        2: { id: "2", value: "other" },
      };

      Model = {
        id: true,
        value: "",
        [store.connect]: {
          get: id => storage[id],
          set: (id, values) => {
            if (!id) {
              maxId += 1;
              const result = { ...values, id: maxId };
              storage[id] = result;
              return result;
            }

            if (values) {
              storage[id || values.id] = values;
              return values;
            }

            delete storage[id];
            return null;
          },
          list: () => Object.keys(storage).map(key => storage[key]),
          loose: true,
        },
      };
    });

    it("throws an error for listing model when list method is not defined", () => {
      Model = { id: true, [store.connect]: { get: () => {} } };
      expect(() => store.get([Model])).toThrow();
    });

    it("throws when cache is set with wrong type", () => {
      expect(() =>
        store.get({ value: "test", [store.connect]: { cache: "lifetime" } }),
      ).toThrow();
    });

    it("rejects an error when id does not match", done => {
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          get: id => storage[id],
          set: (id, values) => ({ ...values, id: parseInt(id, 10) + 1 }),
        },
      };

      const model = store.get(Model, 1);
      store
        .set(model, { value: "test" })
        .catch(e => e)
        .then(e => expect(e).toBeInstanceOf(Error))
        .then(done);
    });

    it("returns a placeholder in error state when get action throws", () => {
      storage = null;
      const model = store.get(Model, 1);
      expect(store.error(model)).toBeInstanceOf(Error);
      expect(store.get(Model, 1)).toBe(model);
    });

    it("does not cache set action when it rejects an error", done => {
      const origStorage = storage;
      storage = null;
      store
        .set(Model, { value: "other" })
        .catch(() => {
          storage = origStorage;
          expect(store.get(Model, 1)).toEqual({ id: "1", value: "test" });
        })
        .then(done);
    });

    it("returns a promise rejecting an error instance when set throws", done => {
      storage = null;
      store
        .set(Model, { value: "test" })
        .catch(e => {
          expect(e).toBeInstanceOf(Error);
        })
        .then(done);
    });

    it("returns a placeholder in error state when get throws primitive value", () => {
      Model = {
        id: true,
        [store.connect]: () => {
          throw Promise.resolve();
        },
      };
      expect(store.error(store.get(Model, 1))).toBeInstanceOf(Promise);
    });

    it("returns a placeholder in error state when list returns null", () => {
      Model = {
        id: true,
        [store.connect]: {
          list: () => null,
        },
      };
      expect(store.error(store.get([Model]))).toBeInstanceOf(Error);
    });

    it("returns an error for not existing model", () => {
      expect(store.error(store.get(Model, 0))).toBeInstanceOf(Error);
    });

    it("returns model from the storage", () => {
      expect(store.get(Model, 1)).toEqual({ id: "1", value: "test" });
    });

    it("returns the same model for string or number id", () => {
      expect(store.get(Model, "1")).toBe(store.get(Model, 1));
    });

    it("returns a list of models", () => {
      expect(store.get([Model])).toEqual([
        { id: "1", value: "test" },
        { id: "2", value: "other" },
      ]);
    });

    it("returns a list of models with parameters", () => {
      expect(store.get([Model], { page: 1 })).toEqual([
        { id: "1", value: "test" },
        { id: "2", value: "other" },
      ]);
    });

    it("adds item to list of models", done => {
      expect(store.get([Model]).length).toBe(2);
      store
        .set(Model, { value: "new value" })
        .then(() => {
          const list = store.get([Model]);
          expect(list.length).toBe(3);
          expect(list[2]).toEqual({ id: "3", value: "new value" });
        })
        .then(done);
    });

    it("removes item form list of models", done => {
      store
        .set(store.get([Model])[0], null)
        .then(() => {
          const list = store.get([Model]);
          expect(list.length).toBe(1);
        })
        .then(done);
    });

    it("returns new list when modifies already existing item", done => {
      const list = store.get([Model]);
      store
        .set(list[0], { value: "new value" })
        .then(() => {
          const newList = store.get([Model]);
          expect(newList).not.toBe(list);
        })
        .then(done);
    });

    it("calls observed properties once", done => {
      const spy = jasmine.createSpy("observe callback");
      const getter = () => store.get([Model]);
      const unobserve = cache.observe({}, "key", getter, spy);

      resolveTimeout(() => {
        expect(spy).toHaveBeenCalledTimes(1);
        unobserve();
      }).then(done);
    });

    it("set states for model instance", () => {
      const model = store.get(Model, 1);
      expect(store.pending(model)).toBe(false);
      expect(store.ready(model)).toBe(true);
      expect(store.error(model)).toBe(false);
    });

    it("for cache set to 'false' calls storage each time", done => {
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          cache: false,
          get: id => storage[id],
        },
      };

      const model = store.get(Model, 1);
      expect(model).toEqual({ id: "1", value: "test" });

      expect(model).toBe(store.get(Model, 1));
      expect(model).toBe(store.get(Model, 1));

      resolveTimeout(() => {
        expect(model).not.toBe(store.get(Model, 1));
      }).then(done);
    });

    it("for cache set to 'false' does not call get for single item", done => {
      const spy = jasmine.createSpy("get");
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          cache: false,
          get: id => {
            spy(id);
            return storage[id];
          },
          list: () => Object.keys(storage).map(key => storage[key]),
          loose: true,
        },
      };

      const model = store.get([Model]);
      requestAnimationFrame(() => {
        expect(model[0]).toEqual({ id: "1", value: "test" });
        expect(spy).toHaveBeenCalledTimes(0);
        done();
      });
    });

    it("for cache set to number get calls storage after timeout", done => {
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          cache: 100,
          get: id => storage[id],
        },
      };

      const model = store.get(Model, 1);
      expect(model).toEqual({ id: "1", value: "test" });
      expect(model).toBe(store.get(Model, 1));

      resolveTimeout(() => {
        expect(model).not.toBe(store.get(Model, 1));
      }).then(done);
    });

    it("uses id returned from set action", done => {
      let count = 2;
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          get: id => storage[id],
          set: (id, values) => {
            if (!id) {
              id = count + 1;
              count += 1;
              values = { id, ...values };
            }
            storage[id] = values;
            return values;
          },
        },
      };

      store
        .set(Model, { value: "test" })
        .then(model => {
          expect(store.get(Model, model.id)).toBe(model);
        })
        .then(done);
    });

    it("clear forces call for model again", done => {
      const model = store.get(Model, 1);
      store.clear(model);
      requestAnimationFrame(() => {
        expect(store.get(Model, 1)).not.toBe(model);
        done();
      });
    });

    it("returns specific model for storage with list method", () => {
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          list: () => [{ id: "1", value: "test" }],
        },
      };

      store.get([Model]);
      expect(store.get(Model, "1")).toEqual({ id: "1", value: "test" });
      expect(store.error(store.get(Model, 2))).not.toBeUndefined();
    });

    describe("with nested array options", () => {
      const setupDep = options => ({
        items: [Model, options],
        [store.connect]: () => ({
          items: Object.keys(storage).map(key => storage[key]),
        }),
      });

      it("throws an error when options are set with wrong type", () => {
        expect(() => store.get({ items: [Model, true] })).toThrow();
      });

      it("returns updated list when loose option is set", done => {
        const DepModel = setupDep({ loose: true });
        store.get(Model, 1);

        const list = store.get(DepModel);
        expect(list.items.length).toBe(2);

        store
          .set(list.items[0], null)
          .then(() => {
            const newList = store.get(DepModel);
            expect(newList.items.length).toBe(1);
          })
          .then(done);
      });

      it("returns the same list if loose options are not set", done => {
        const DepModel = setupDep();
        store.get(Model, 1);

        const list = store.get(DepModel);
        expect(list.items.length).toBe(2);

        store
          .set(list.items[0], null)
          .then(() => {
            const newList = store.get(DepModel);
            expect(store.error(newList.items[0])).toBeInstanceOf(Error);
            expect(newList.items.length).toBe(2);
          })
          .then(done);
      });

      it("returns the same list if loose options are not set", done => {
        const DepModel = setupDep({ loose: false });
        store.get(Model, 1);

        const list = store.get(DepModel);
        expect(list.items.length).toBe(2);

        store
          .set(list.items[0], null)
          .then(() => {
            const newList = store.get(DepModel);
            expect(store.error(newList.items[0])).toBeInstanceOf(Error);
            expect(newList.items.length).toBe(2);
          })
          .then(done);
      });

      it("returns updated list if one of many loose arrays changes", done => {
        const otherStorage = {
          "1": { id: "1", value: "test" },
        };
        const NewModel = {
          id: true,
          value: "",
          [store.connect]: {
            get: id => otherStorage[id],
            set: (id, values) => {
              if (values === null) {
                delete otherStorage[id];
                return null;
              }

              otherStorage[id] = values;
              return values;
            },
          },
        };

        const DepModel = {
          items: [Model, { loose: true }],
          otherItems: [NewModel, { loose: true }],
          [store.connect]: () => ({
            items: Object.keys(storage).map(key => storage[key]),
            otherItems: Object.keys(otherStorage).map(key => otherStorage[key]),
          }),
        };

        const list = store.get(DepModel);
        store.set(list.otherItems[0], null);

        requestAnimationFrame(() => {
          const newList = store.get(DepModel);
          expect(newList.otherItems.length).toBe(0);
          done();
        });
      });
    });

    it("set action receives list of updated keys", done => {
      const spy = jasmine.createSpy();
      Model = {
        one: "one",
        two: "two",
        [store.connect]: {
          get: () => {},
          set: (id, values, keys) => {
            spy(keys);
            return values;
          },
        },
      };

      store
        .set(Model, { two: "other" })
        .then(() => {
          expect(spy).toHaveBeenCalled();

          const args = spy.calls.first().args;
          expect(args[0]).toEqual(["two"]);
        })
        .then(done);
    });
  });

  describe("connected to async storage -", () => {
    let fn;
    beforeEach(() => {
      fn = id => Promise.resolve({ id, value: "true" });
      Model = {
        id: true,
        value: "",
        [store.connect]: id => fn(id),
      };
    });

    it("rejects an error when promise resolves with other type than object", done => {
      fn = () => Promise.resolve("value");

      store.get(Model, 1);

      Promise.resolve()
        .then(() => {})
        .then(() => {
          const model = store.get(Model, 1);
          expect(store.error(model)).toBeInstanceOf(Error);
        })
        .then(done);
    });

    it("returns a placeholder in pending state", () => {
      const placeholder = store.get(Model, 1);
      expect(placeholder).toBeInstanceOf(Object);
      expect(() => placeholder.value).toThrow();
    });

    it("returns a placeholder in error state for not found singleton model", done => {
      Model = {
        value: "test",
        [store.connect]: {
          get: () => Promise.resolve(),
          set: (id, values) => Promise.resolve(values),
        },
      };

      const pendingModel = store.get(Model);
      store
        .pending(pendingModel)
        .then(model => {
          expect(store.error(model)).toBeInstanceOf(Error);
        })
        .then(done);
    });

    it("calls storage get action once for permanent cache", () => {
      const spy = jasmine.createSpy();
      fn = id => {
        spy(id);
        return Promise.resolve({ id, value: "test" });
      };
      store.get(Model, 1);
      store.get(Model, 1);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("calls storage get action once for time-based cache", () => {
      const spy = jasmine.createSpy();
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          cache: 100,
          get: id => {
            spy(id);
            return Promise.resolve({ id, value: "test" });
          },
        },
      };

      store.get(Model, 1);
      store.get(Model, 1);

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("calls observe method twice (pending & ready states)", done => {
      const spy = jasmine.createSpy();
      cache.observe({}, "key", () => store.get(Model, "1"), spy);

      resolveTimeout(() => {
        expect(spy).toHaveBeenCalledTimes(2);
      }).then(done);
    });

    it("returns cached external nested object in pending state", done => {
      Model = {
        id: true,
        value: "",
        nestedExternalObject: {
          id: true,
          value: "test",
          [store.connect]: {
            cache: false,
            get: id => Promise.resolve({ id, value: "one" }),
          },
        },
        [store.connect]: {
          cache: false,
          get: id =>
            Promise.resolve({
              id,
              value: "test",
              nestedExternalObject: "1",
            }),
          set: (id, values) => Promise.resolve(values),
        },
      };

      store
        .pending(store.get(Model, 1))
        .then(() => {
          const model = store.get(Model, 1);
          const nestedModel = model.nestedExternalObject;

          return store.pending(nestedModel).then(() => {
            const resolvedNestedModel = model.nestedExternalObject;
            expect(resolvedNestedModel).not.toBe(nestedModel);

            store.set(model, { value: "test 2" });
            expect(model.nestedExternalObject).toBe(resolvedNestedModel);
          });
        })
        .then(done);
    });

    it("returns cached item of list in pending state", done => {
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          cache: false,
          get: id =>
            Promise.resolve({
              id,
              value: "test",
            }),
          set: (id, values) => Promise.resolve(values),
          list: () => Promise.resolve(["1"]),
          loose: true,
        },
      };

      store
        .pending(store.get([Model]))
        .then(models => store.pending(models[0]).then(() => models))
        .then(models => {
          const model = models[0];

          store.set(model, { value: "new value" }).then(nextModel => {
            const nextModels = store.get([Model]);
            expect(nextModels[0]).toBe(nextModel);
          });
        })
        .then(done);
    });

    it("returns the same list after timestamp changes", done => {
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          cache: 1000 * 30,
          get: () => {},
          list: () => Promise.resolve([{ id: "1", value: "test" }]),
          loose: true,
        },
      };

      store.pending(store.get([Model])).then(resolvedModel => {
        setTimeout(() => {
          expect(store.get([Model])).toBe(resolvedModel);
          done();
        }, 100);
      });
    });

    it("returns a list with parameters", done => {
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          list: () => Promise.resolve([{ id: "1", value: "test" }]),
        },
      };

      store.pending(store.get([Model], { page: 1 })).then(resolvedModel => {
        expect(resolvedModel).toEqual([{ id: "1", value: "test" }]);
        done();
      });
    });

    it("returns placeholder in async calls for long fetching model", done => {
      let resolvePromise;
      Model = {
        id: true,
        value: "",
        [store.connect]: {
          cache: false,
          get: id =>
            new Promise(resolve => {
              resolvePromise = () => resolve({ id, value: "test" });
            }),
        },
      };

      const pendingModel = store.get(Model, 1);
      expect(store.pending(pendingModel)).toBeInstanceOf(Promise);
      expect(() => pendingModel.value).toThrow();

      let resolvedModel;
      requestAnimationFrame(() => {
        resolvedModel = store.get(Model, 1);
        expect(store.pending(resolvedModel)).toBeInstanceOf(Promise);

        requestAnimationFrame(() => {
          resolvedModel = store.get(Model, 1);
          expect(store.pending(resolvedModel)).toBeInstanceOf(Promise);

          resolvePromise();
          Promise.resolve().then(() => {
            resolvedModel = store.get(Model, 1);
            expect(store.pending(resolvedModel)).toBe(false);

            requestAnimationFrame(() => {
              resolvedModel = store.get(Model, 1);
              expect(store.pending(resolvedModel)).toBeInstanceOf(Promise);
              done();
            });
          });
        });
      });
    });

    describe("for success", () => {
      it("sets pending state", done => {
        expect(store.pending(store.get(Model, 1))).toBeInstanceOf(Promise);

        Promise.resolve()
          .then(() => {
            expect(store.pending(store.get(Model, 1))).toBe(false);
          })
          .then(done);
      });

      it("sets ready state", done => {
        expect(store.ready(store.get(Model, 1))).toBe(false);

        Promise.resolve()
          .then(() => {
            expect(store.ready(store.get(Model, 1))).toBe(true);
          })
          .then(done);
      });

      it("sets error state", done => {
        expect(store.error(store.get(Model, 1))).toBe(false);

        Promise.resolve()
          .then(() => {
            expect(store.error(store.get(Model, 1))).toBe(false);
          })
          .then(done);
      });
    });

    describe("for error", () => {
      beforeEach(() => {
        fn = () => Promise.reject(Error("some error"));
      });

      it("caches an error result", done => {
        store.get(Model, 1);
        Promise.resolve()
          .then(() => {})
          .then(() => {
            expect(store.get(Model, 1)).toBe(store.get(Model, 1));
          })
          .then(done);
      });

      it("sets pending state", done => {
        expect(store.pending(store.get(Model, 1))).toBeInstanceOf(Promise);

        Promise.resolve()
          .then(() => {})
          .then(() => {
            expect(store.pending(store.get(Model, 1))).toBe(false);
          })
          .then(done);
      });

      it("sets ready state", done => {
        expect(store.ready(store.get(Model, 1))).toBe(false);

        Promise.resolve()
          .then(() => {})
          .then(() => {
            expect(store.ready(store.get(Model, 1))).toBe(false);
          })
          .then(done);
      });

      it("sets error state", done => {
        expect(store.error(store.get(Model, 1))).toBe(false);

        Promise.resolve()
          .then(() => {})
          .then(() => {
            expect(store.error(store.get(Model, 1))).toBeInstanceOf(Error);
          })
          .then(done);
      });

      it("sets pending state for singleton", done => {
        Model = {
          value: "test",
          [store.connect]: {
            get: () => Promise.reject(Error("some error")),
            set: () => Promise.reject(Error("some error")),
          },
        };

        store.get(Model);

        Promise.resolve()
          .then(() => {})
          .then(() => {
            const model = store.get(Model);
            expect(store.error(model)).toBeInstanceOf(Error);

            store.set(Model, { value: "other" }).catch(() => {});
            const nextModel = store.get(Model);
            expect(store.pending(nextModel)).toBeInstanceOf(Promise);
            return Promise.resolve()
              .then(() => {})
              .then(() => {
                expect(store.pending(nextModel)).toBe(false);
              });
          })
          .then(done);
      });
    });
  });

  describe("offline storage", () => {
    window.localStorage.clear();
    let isOffline;

    beforeEach(() => {
      isOffline = false;
    });

    it("throws when nested model has 'offline' option set to lower value", () => {
      const NestedModel = {
        value: "nested model",
        [store.connect]: {
          offline: 100,
          get: () => Promise.resolve().then(() => ({})),
        },
      };

      Model = {
        nestedModel: NestedModel,
        [store.connect]: {
          offline: true,
          get: () => Promise.resolve().then(() => ({ nestedModel: {} })),
        },
      };

      expect(() => store.get(Model)).toThrow();

      Model = {
        nestedModels: [NestedModel],
        [store.connect]: {
          offline: true,
          get: () => ({ nestedModels: [{}] }),
        },
      };

      expect(() => store.get(Model)).toThrow();
    });

    it("returns model from offline cache", () => {
      Model = {
        id: true,
        value: "returns model",
        [store.connect]: {
          cache: false,
          offline: true,
          get: id => {
            if (isOffline) throw Error("Offline");
            return Promise.resolve().then(() => ({ id, value: "test" }));
          },
          list: () => {
            if (isOffline) throw Error("Offline");
            return Promise.resolve().then(() => ["1", "2"]);
          },
        },
      };

      return store.pending(store.get(Model, "1")).then(() =>
        store.pending(store.get([Model])).then(() => {
          store.clear(Model, false);
          return resolveRaf(() => {
            const cacheModel = store.get(Model, "1");
            expect(cacheModel.value).toBe("test");

            const cacheList = store.get([Model]);
            expect(cacheList.length).toBe(2);

            return resolveRaf(() => {
              cache.invalidateAll(storeConfigs.get(Model), {
                clearValue: true,
              });
              cache.invalidateAll(storeLists.get(Model), { clearValue: true });

              isOffline = true;
              const offlineModel = store.get(Model, "1");
              expect(offlineModel.value).toBe("test");
              expect(store.error(offlineModel)).toBeInstanceOf(Error);

              const offlineList = store.get([Model]);
              expect(offlineList.length).toBe(2);
              expect(store.error(offlineList)).toBeInstanceOf(Error);
            });
          });
        }),
      );
    });

    it("returns model with circular reference from offline cache", () => {
      Model = {
        id: true,
        value: "circular reference",
        model: store.ref(() => Model),
        [store.connect]: {
          cache: 0,
          offline: true,
          get: id => {
            if (isOffline) throw Error("Offline");
            return { value: "test", model: id };
          },
        },
      };

      let model = store.get(Model, "1");
      isOffline = true;
      store.clear(Model, false);
      model = store.get(Model, "1");

      expect(store.error(model)).toBeInstanceOf(Error);
      expect(model.model).toBe(model);
    });

    it("cleans up the localStorage from obsolete models", () => {
      Model = {
        id: true,
        value: "cleans up",
        [store.connect]: {
          offline: 1,
          cache: 1,
          get: id => Promise.resolve().then(() => ({ id })),
        },
      };

      return store.pending(store.get(Model, "1")).then(model =>
        resolveTimeout(() => {
          store.get(Model, "2");
          store.clear(model);

          return resolveTimeout(() => {
            const pendingModel = store.get(Model, "1");
            expect(() => pendingModel.value).toThrow();
          });
        }),
      );
    });

    it("cleans up the localStorage when model reaches threshold", () => {
      Model = {
        id: true,
        value: "cleans up threshold",
        [store.connect]: {
          offline: 100,
          cache: false,
          get: id => Promise.resolve().then(() => ({ id, value: Date.now() })),
        },
      };

      return store.pending(store.get(Model, "1")).then(model => {
        cache.invalidateAll(storeConfigs.get(Model), {
          clearValue: true,
        });

        const cachedModel = store.get(Model, "1");
        expect(store.ready(cachedModel)).toBe(true);

        return resolveTimeout(() => {
          isOffline = true;
          cache.invalidateAll(storeConfigs.get(Model), {
            clearValue: true,
          });
          const pendingModel = store.get(Model, "1");
          expect(store.ready(pendingModel)).toBe(false);
          return store.pending(pendingModel).then(resultModel => {
            expect(resultModel.value).not.toBe(model.value);
          });
        });
      });
    });

    it("clears values when clear method is called for model instance", () => {
      Model = {
        id: true,
        value: "clears values for instance",
        [store.connect]: {
          offline: true,
          get: id => Promise.resolve().then(() => ({ id })),
        },
      };

      store.get(Model, "2");

      return store.pending(store.get(Model, "1")).then(model => {
        store.clear(model);
        expect(() => store.get(Model, "1").value).toThrow();
      });
    });

    it("clears values when clear method is called for model definition", () => {
      Model = {
        id: true,
        value: "clears values for definition",
        [store.connect]: {
          offline: true,
          get: id => Promise.resolve().then(() => ({ id })),
        },
      };

      store.get(Model, "2");

      return store.pending(store.get(Model, "1")).then(() => {
        store.clear(Model);
        expect(() => store.get(Model, "1").value).toThrow();
      });
    });

    it("stores nested objects and models", () => {
      const OtherModel = {
        id: true,
        value: "other model",
        [store.connect]: {
          get: id => ({ id }),
        },
      };

      const OtherOfflineModel = {
        id: true,
        value: "offline model",
        [store.connect]: {
          offline: true,
          get: id => ({ id }),
        },
      };

      Model = {
        nested: {
          value: "test",
        },
        model: OtherModel,
        offlineModel: OtherOfflineModel,
        listOfflineModel: [OtherOfflineModel],
        [store.connect]: {
          offline: true,
          get: () => {
            if (isOffline) throw Error("Offline");
            return Promise.resolve().then(() => ({
              model: "1",
              offlineModel: "1",
              listOfflineModel: ["1", "2"],
            }));
          },
        },
      };

      return store.pending(store.get(Model)).then(model => {
        expect(model.offlineModel.value).toBe("offline model");
      });
    });

    it("sets null for the offline cache with sync storage", () => {
      Model = {
        id: true,
        value: "sets null sync",
        [store.connect]: {
          get: () => null,
          offline: true,
        },
      };

      const model = store.get(Model, 1);
      expect(store.error(model)).toBeInstanceOf(Error);
    });

    it("sets null for the offline cache with async storage", () => {
      Model = {
        id: true,
        value: "sets null async",
        [store.connect]: {
          get: () => Promise.resolve(null),
          offline: true,
        },
      };

      return store.pending(store.get(Model, 1)).then(model => {
        expect(store.error(model)).toBeInstanceOf(Error);
      });
    });

    it("updates cache value when model is updated", () => {
      Model = {
        id: true,
        value: "updates cache",
        [store.connect]: {
          offline: true,
          get: id => {
            if (isOffline) throw Error("Offline");
            return { id };
          },
          set: (id, values) => values,
        },
      };

      const model = store.get(Model, 1);
      return store.set(model, { value: "other value" }).then(() => {
        isOffline = true;
        cache.invalidateAll(storeConfigs.get(Model), { clearValue: true });

        const newModel = store.get(Model, 1);
        expect(newModel.value).toBe("other value");
      });
    });
  });
});

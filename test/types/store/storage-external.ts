import { IEnumerable } from "./.internals/enumerable/enumerable.entity";
import { Enumerable } from "./.internals/enumerable/enumerable.store";
import { Model, ModelIdentifier, StorageValues, store } from "/types/index";

const EnumerableModelsSource = new Map<
  ModelIdentifier,
  StorageValues<IEnumerable>
>([
  ["0", { id: "0", stringProperty: "qweqwe", numberProperty: 5, nestedEnumerable: "2" }],
  ["1", { id: "1", numberProperty: 1711014651455, nestedEnumerables: ["1", "2"] }],
  ["2", { id: "2", stringProperty: "swswswsws" }],
]);

const EnumerableModelStore: Model<IEnumerable> = {
  ...Enumerable,
  [store.connect]: {
    list: (id) => [...Object.values(EnumerableModelsSource)],
    get: (id) => EnumerableModelsSource.get(id) ?? null,
    set: (id, values) => {
      if (id === undefined && values) {
        // create
        const autoincrement = String(EnumerableModelsSource.size);

        EnumerableModelsSource.set(autoincrement, {
          ...values,
          id: autoincrement,
        });

        return EnumerableModelsSource.get(autoincrement) ?? null;
      }

      if (id && values) {
        // update
        const lastSourceValue = EnumerableModelsSource.get(id);
        if (!lastSourceValue) throw new Error();

        EnumerableModelsSource.set(id, { ...lastSourceValue, ...values });

        const newValue = EnumerableModelsSource.get(id);
        if (!newValue) throw new Error();
        return newValue;
      }

      if (id && !values) {
        // delete
        EnumerableModelsSource.delete(id);
        return EnumerableModelsSource.get(id) ?? null;
      }

      throw new Error();
    },
  },
};

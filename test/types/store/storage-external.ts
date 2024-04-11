import { Model, ModelIdentifier, StorageValues, store } from "/types/index";
import EnumerableStore, { IEnumerable } from "./enumerable-definition.store";

const EnumerableModelsSource = new Map<
  ModelIdentifier,
  StorageValues<IEnumerable>
>([
  ["0", { id: "0", prop: "qweqwe", length: 5, relatedEnumerable: "2" }],
  ["1", { id: "1", length: 1711014651455, relatedEnumerables: ["1", "2"] }],
  ["2", { id: "2", prop: "swswswsws" }],
]);

const EnumerableModelStore: Model<IEnumerable> = {
  ...EnumerableStore,
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

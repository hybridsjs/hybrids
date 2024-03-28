import { Model, StorageValues, store } from "/types/index";
import EnumerableStore, { IEnumerable } from "./enumerable-definition.store.test";

const EnumerableModelsSource: { [key: number]: StorageValues<IEnumerable>; } = {
  0: { id: "0", prop: 'qweqwe', length: 5, relatedModel: "2" },
  1: { id: "1", length: 1711014651455, relatedModels: ["1", "2"] },
  2: { id: "2", prop: 'swswswsws' },
};

const EnumerableModelStore: Model<IEnumerable> = {
  ...EnumerableStore,
  [store.connect]: {
    list: (id) => [...Object.values(EnumerableModelsSource)],
  }
};

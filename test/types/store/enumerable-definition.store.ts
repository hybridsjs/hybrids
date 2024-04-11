import SingletonStore, { ISingleton } from "./singleton-definition.store";
import { Model, store } from "/types/index";

export interface IEnumerable {
  id: string;
  prop: string;
  length: number;
  relatedSingleton?: ISingleton;
  relatedEnumerable?: IEnumerable;
  relatedEnumerables: IEnumerable[];
}

const EnumerableStore: Model<IEnumerable> = {
  id: true,
  prop: "",
  length: 0,
  relatedSingleton: store.ref(() => SingletonStore),
  relatedEnumerable: store.ref(() => EnumerableStore),
  relatedEnumerables: store.ref(() => [EnumerableStore]),
};

export default EnumerableStore;

/// @ts-expect-error
const BrokenEnumerableStore: Model<IEnumerable> = {
  prop: "",
  length: 0,
  relatedSingleton: store.ref(() => SingletonStore),
  relatedEnumerable: store.ref(() => EnumerableStore),
  relatedEnumerables: store.ref(() => [EnumerableStore]),
};

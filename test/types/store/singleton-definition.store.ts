import EnumerableStore, { IEnumerable } from "./enumerable-definition.store";
import { Model, store } from "/types/index";

export interface ISingleton {
  prop: string;
  length: number;
  relatedSingleton?: ISingleton;
  relatedEnumerable?: IEnumerable;
  relatedEnumerables: IEnumerable[];
}

const SingletonStore: Model<ISingleton> = {
  prop: "",
  length: 0,
  relatedSingleton: store.ref(() => SingletonStore),
  relatedEnumerable: store.ref(() => EnumerableStore),
  relatedEnumerables: store.ref(() => [EnumerableStore]),
};

export default SingletonStore;

const BrokenSingletonStore: Model<ISingleton> = {
  /// @ts-expect-error
  id: true,
  prop: "",
  length: 0,
  relatedSingleton: store.ref(() => SingletonStore),
  relatedEnumerable: store.ref(() => EnumerableStore),
  relatedEnumerables: store.ref(() => [EnumerableStore]),
};

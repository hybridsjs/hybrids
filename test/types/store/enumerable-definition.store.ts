import { Model, store } from "/types/index";

export interface IEnumerable {
  id: string;
  prop: string;
  length: number;
  relatedModel?: IEnumerable;
  relatedModels: IEnumerable[];
}

const EnumerableStore: Model<IEnumerable> = {
  id: true,
  prop: "",
  length: 0,
  relatedModel: store.ref(() => EnumerableStore),
  relatedModels: store.ref(() => [EnumerableStore]),
};

export default EnumerableStore;

/// @ts-expect-error
const BrokenEnumerableStore: Model<IEnumerable> = {
  prop: "",
  length: 0,
  relatedModel: store.ref(() => EnumerableStore),
  relatedModels: store.ref(() => [EnumerableStore]),
};
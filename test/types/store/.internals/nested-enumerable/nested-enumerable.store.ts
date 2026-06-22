import { DeepNestedEnumerable } from "../deep-nested-enumerable/deep-nested-enumerable.store";
import { Singleton } from "../singleton/singleton.store";
import { INestedEnumerable } from "./nested-enumerable.entity";
import { Model, store } from "/types";

export const NestedEnumerable: Model<INestedEnumerable> = {
  id: true,
  stringProperty: "",
  numberProperty: 0,
  nestedSingleton: store.ref(() => Singleton),
  optionalNestedSingleton: store.ref(() => Singleton),
  nestedEnumerable: store.ref(() => DeepNestedEnumerable),
  optionalNestedEnumerable: store.ref(() => DeepNestedEnumerable),
  nestedEnumerables: store.ref(() => [DeepNestedEnumerable]),
};

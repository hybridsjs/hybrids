import { NestedEnumerable } from "../nested-enumerable/nested-enumerable.store";
import { Singleton } from "../singleton/singleton.store";
import { IEnumerable } from "./enumerable.entity";
import { Model, store } from "/types";

export const Enumerable: Model<IEnumerable> = {
  id: true,
  stringProperty: "",
  numberProperty: 0,
  self: store.ref(() => Enumerable),
  nestedSingleton: store.ref(() => Singleton),
  optionalNestedSingleton: store.ref(() => Singleton),
  nestedEnumerable: store.ref(() => NestedEnumerable),
  optionalNestedEnumerable: store.ref(() => NestedEnumerable),
  nestedEnumerables: store.ref(() => [NestedEnumerable]),
}

/// @ts-expect-error
const BrokenEnumerable: Model<IEnumerable> = {
  stringProperty: "",
  numberProperty: 0,
  self: store.ref(() => Enumerable),
  nestedSingleton: store.ref(() => Singleton),
  optionalNestedSingleton: store.ref(() => Singleton),
  nestedEnumerable: store.ref(() => NestedEnumerable),
  optionalNestedEnumerable: store.ref(() => NestedEnumerable),
  nestedEnumerables: store.ref(() => [NestedEnumerable]),
};
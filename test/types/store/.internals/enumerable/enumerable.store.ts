import { NestedEnumerable } from "../nested-enumerable/nested-enumerable.store";
import { Singleton } from "../singleton/singleton.store";
import { IEnumerable } from "./enumerable.entity";
import { ModelDefinition, store } from "/types";

export const Enumerable: ModelDefinition<IEnumerable> = {
  id: true,
  stringProperty: "",
  numberProperty: 0,
  self: store.ref(() => Enumerable),
  nestedSingleton: store.ref(() => Singleton),
  optionalNestedSingleton: store.ref(() => Singleton),
  nestedEnumerable: store.ref(() => NestedEnumerable),
  optionalNestedEnumerable: store.ref(() => NestedEnumerable),
  nestedEnumerables: store.ref(() => [NestedEnumerable]),
};

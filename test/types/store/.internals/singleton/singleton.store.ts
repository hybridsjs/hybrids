import { NestedEnumerable } from "../nested-enumerable/nested-enumerable.store";
import { ISingleton } from "./singleton.entity";
import { Model, store } from "/types";

export const Singleton: Model<ISingleton> = {
    stringProperty: "",
    numberProperty: 0,
    self: store.ref(() => Singleton),
    nestedSingleton: store.ref(() => Singleton),
    optionalNestedSingleton: store.ref(() => Singleton),
    nestedEnumerable: store.ref(() => NestedEnumerable),
    optionalNestedEnumerable: store.ref(() => NestedEnumerable),
    nestedEnumerables: store.ref(() => [NestedEnumerable]),
}

const BrokenSingleton: Model<ISingleton> = {
    /// @ts-expect-error
    id: true,
    stringProperty: "",
    numberProperty: 0,
    self: store.ref(() => Singleton),
    nestedSingleton: store.ref(() => Singleton),
    optionalNestedSingleton: store.ref(() => Singleton),
    nestedEnumerable: store.ref(() => NestedEnumerable),
    optionalNestedEnumerable: store.ref(() => NestedEnumerable),
    nestedEnumerables: store.ref(() => [NestedEnumerable]),
};
import { store } from "hybrids";
import SingletonStore, { ISingleton } from "./singleton-definition.store.test";
import EnumerableStore, { IEnumerable } from "./enumerable-definition.store.test";

const SingletonNodel: Promise<ISingleton> = store.resolve(SingletonStore)
const EnumerableNodel: Promise<IEnumerable> = store.resolve(EnumerableStore)
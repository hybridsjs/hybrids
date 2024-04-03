import { store } from "/types/index";
import SingletonStore, { ISingleton } from "./singleton-definition.store";
import EnumerableStore, { IEnumerable } from "./enumerable-definition.store";

const SingletonNodel: Promise<ISingleton> = store.resolve(SingletonStore);
const EnumerableNodel: Promise<IEnumerable> = store.resolve(EnumerableStore);

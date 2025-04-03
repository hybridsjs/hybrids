import { store } from "/types/index";
import SingletonStore, { ISingleton } from "./singleton-definition.store";
import EnumerableStore, { IEnumerable } from "./enumerable-definition.store";

const SingletonModelPromise: Promise<ISingleton> =
  store.resolve(SingletonStore);
const SingletonModel = await SingletonModelPromise;

const EnumerableModelPromise: Promise<IEnumerable> =
  store.resolve(EnumerableStore);
const EnumerableModel = await EnumerableModelPromise;

const EnumerableModelListPromise: Promise<IEnumerable[]> = store.resolve([
  EnumerableStore,
]);
const EnumerableModelList = await EnumerableModelListPromise;

store.get(SingletonStore);
store.get([SingletonStore]);

store.get(EnumerableStore);
store.get([EnumerableStore]);


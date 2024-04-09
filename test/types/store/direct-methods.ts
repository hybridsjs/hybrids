import { store } from "/types/index";
import SingletonStore, { ISingleton } from "./singleton-definition.store";
import EnumerableStore, { IEnumerable } from "./enumerable-definition.store";

const SingletonModelPromise: Promise<ISingleton> = store.resolve(SingletonStore);
const SingletonModel = await SingletonModelPromise;

const EnumerableModelPromise: Promise<IEnumerable> = store.resolve(EnumerableStore);
const EnumerableModel = await EnumerableModelPromise;

store.get(SingletonStore);
store.get([SingletonStore]);

store.get(EnumerableStore);
store.get([EnumerableStore]);


// ############################################### Create Singleton ###############################################

store.set(SingletonStore, {
  prop: "qweqwe",
});

store.set(SingletonStore, {
  relatedEnumerable: {},
  relatedSingleton: {},
  relatedEnumerables: [{}, {}],
});

store.set(SingletonStore, {
  // an error is expected, but I couldn't type it(
  relatedEnumerable: [{}, {}],
  // an error is expected, but I couldn't type it(
  relatedSingleton: [{}, {}],
  /// @ts-expect-error
  relatedEnumerables: {},
});


// ############################################### Update Singleton ###############################################

store.set(SingletonModel, {
  prop: "qweqwe",
});

store.set(SingletonModel, {
  relatedEnumerable: {},
  relatedSingleton: {},
  relatedEnumerables: [{}, {}],
});

store.set(SingletonModel, {
  // an error is expected, but I couldn't type it(
  relatedEnumerable: [{}, {}],
  // an error is expected, but I couldn't type it(
  relatedSingleton: [{}, {}],
  /// @ts-expect-error
  relatedEnumerables: {},
});


// ############################################### Delete Singleton ###############################################

// an error is expected, but when determining overload, the display of errors for incorrect values ​​in Model Update breaks
store.set(SingletonModel, null);
store.set(EnumerableModel, null);


// ############################################### Create Enumerable ###############################################

store.set(EnumerableStore, {
  prop: "qweqwe",
});

store.set(EnumerableStore, {
  relatedEnumerable: {},
  relatedSingleton: {},
  relatedEnumerables: [{}, {}],
});

store.set(EnumerableStore, {
  // an error is expected, but I couldn't type it(
  relatedEnumerable: [{}, {}],
  // an error is expected, but I couldn't type it(
  relatedSingleton: [{}, {}],
  /// @ts-expect-error
  relatedEnumerables: {},
});


// ############################################### Update Enumerable ###############################################

store.set(EnumerableModel, {
  prop: "qweqwe",
});

store.set(EnumerableModel, {
  relatedEnumerable: {},
  relatedSingleton: {},
  relatedEnumerables: [{}, {}],
});

store.set(EnumerableModel, {
  // an error is expected, but I couldn't type it(
  relatedEnumerable: [{}, {}],
  // an error is expected, but I couldn't type it(
  relatedSingleton: [{}, {}],
  /// @ts-expect-error
  relatedEnumerables: {},
});


// ############################################### Delete Enumerable ###############################################
// an error is expected, but when determining overload, the display of errors for incorrect values ​​in Model Update breaks
store.set(EnumerableStore, null);
store.set(EnumerableModel, null);

import { store } from "hybrids";
import ExampleSingletonStore, { IExampleSingleton } from "./store-singleton-definition.store.test";
import ExampleEnumerableStore, { IExampleEnumerable } from "./store-enumerable-definition.store.test";

const exampleSingletonNodel: Promise<IExampleSingleton> = store.resolve(ExampleSingletonStore)
const exampleEnumerableNodel: Promise<IExampleEnumerable> = store.resolve(ExampleEnumerableStore)
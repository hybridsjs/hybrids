import { Enumerable } from "../.internals/enumerable/enumerable.store";
import { IEnumerable } from "../.internals/enumerable/enumerable.entity";
import { Singleton } from "../.internals/singleton/singleton.store";
import { ISingleton } from "../.internals/singleton/singleton.entity";
import { store } from "/types";

const singleton = store.get(Singleton);
const enumerable = store.sync(Enumerable, { id: "1" });

let singletonPromiseInput: Promise<ISingleton>;
let enumerablePromiseInput: Promise<IEnumerable>;
let singletonListPromiseInput: Promise<ISingleton[]>;
let enumerableListPromiseInput: Promise<IEnumerable[]>;

// Overload via Definition
{
  // ...read singleton
  singletonPromiseInput = store.resolve(Singleton);
  // ...read unidentified model
  enumerablePromiseInput = store.resolve(Enumerable); // looks strange

  // read identified model
  singletonPromiseInput = store.resolve(Singleton, "1"); // looks strange
  enumerablePromiseInput = store.resolve(Enumerable, "1");

  // read queried model
  singletonPromiseInput = store.resolve(Singleton, { a: 1, b: 2 }); // looks strange
  enumerablePromiseInput = store.resolve(Enumerable, { a: 1, b: 2 });
}

// Overload via [Definition]
{
  // ...read unidentified list
  singletonListPromiseInput = store.resolve([Singleton]); // looks strange
  enumerableListPromiseInput = store.resolve([Enumerable]);

  // ...read identified list
  singletonListPromiseInput = store.resolve([Singleton], "1"); // looks strange
  enumerableListPromiseInput = store.resolve([Enumerable], "1");

  // ...read queried list
  singletonListPromiseInput = store.resolve([Singleton], { a: 1, b: 2 }); // looks strange
  enumerableListPromiseInput = store.resolve([Enumerable], { a: 1, b: 2 });
}

// Overload via instance
{
  singletonPromiseInput = store.resolve(singleton);
  enumerablePromiseInput = store.resolve(enumerable);
}

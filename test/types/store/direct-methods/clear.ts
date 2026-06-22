import { Enumerable } from "../.internals/enumerable/enumerable.store";
import { Singleton } from "../.internals/singleton/singleton.store";
import { store } from "/types";

const singleton = store.get(Singleton);
const enumerable = store.sync(Enumerable, { id: "1" });

// Overload via Definition
{
  store.clear(Singleton);
  store.clear(Enumerable);
  store.clear(Singleton, true);
  store.clear(Enumerable, true);
}

// Overload via instance
{
  store.clear(singleton);
  store.clear(enumerable);
  store.clear(singleton, true);
  store.clear(enumerable, true);
}

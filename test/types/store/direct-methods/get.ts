import { IEnumerable } from "../.internals/enumerable/enumerable.entity";
import { Enumerable } from "../.internals/enumerable/enumerable.store";
import { ISingleton } from "../.internals/singleton/singleton.entity";
import { Singleton } from "../.internals/singleton/singleton.store";
import { store } from "/types";

let singletonInput: ISingleton
let singletonListInput: ISingleton[]
let enumerableInput: IEnumerable
let enumerableListInput: IEnumerable[]

// Overload via Definition
{
    // ...read singleton
    singletonInput = store.get(Singleton);
    // ...read unidentified model
    enumerableInput = store.get(Enumerable); // looks strange

    // read identified model
    singletonInput = store.get(Singleton, "1"); // looks strange
    enumerableInput = store.get(Enumerable, "1");

    // read queried model
    singletonInput = store.get(Singleton, { a: 1, b: 2 }); // looks strange
    enumerableInput = store.get(Enumerable, { a: 1, b: 2 });
}

// Overload via [Definition]
{
    // ...read unidentified list
    singletonListInput = store.get([Singleton]); // looks strange
    enumerableListInput = store.get([Enumerable]);

    // ...read identified list
    singletonListInput = store.get([Singleton], "1"); // looks strange
    enumerableListInput = store.get([Enumerable], "1");

    // ...read queried list
    singletonListInput = store.get([Singleton], { a: 1, b: 2 }); // looks strange
    enumerableListInput = store.get([Enumerable], { a: 1, b: 2 });
}
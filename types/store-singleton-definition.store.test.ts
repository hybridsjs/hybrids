// This test is not intended to be run by JavaScript.
// This test is for static analysis of TypeScript and must be run by TypeScript-compiler to detect errors.

import { Model } from "hybrids";

export interface IExampleSingleton {
    prop: string;
    length: number;
}

const ExampleSingletonStore: Model<IExampleSingleton> = {
    prop: "",
    length: 0,
};

export default ExampleSingletonStore

const ExampleBrokenSingletonStore: Model<IExampleSingleton> = {
    /// @ts-expect-error
    id: true,
    prop: "",
    length: 0,
};
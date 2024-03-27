// This test is not intended to be run by JavaScript.
// This test is for static analysis of TypeScript and must be run by TypeScript-compiler to detect errors.

import { Model } from "hybrids";

export interface IExampleEnumerable {
    id: string;
    prop: string;
    length: number;
}

const ExampleEnumerableStore: Model<IExampleEnumerable> = {
    id: true,
    prop: "",
    length: 0,
};

export default ExampleEnumerableStore;

/// @ts-expect-error
const ExampleBrokenEnumerableStore: Model<IExampleEnumerable> = {
    prop: "",
    length: 0,
};
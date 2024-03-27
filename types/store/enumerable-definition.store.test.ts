// This test is not intended to be run by JavaScript.
// This test is for static analysis of TypeScript and must be run by TypeScript-compiler to detect errors.

import { Model } from "hybrids";

export interface IEnumerable {
    id: string;
    prop: string;
    length: number;
}

const EnumerableStore: Model<IEnumerable> = {
    id: true,
    prop: "",
    length: 0,
};

export default EnumerableStore;

/// @ts-expect-error
const BrokenEnumerableStore: Model<IEnumerable> = {
    prop: "",
    length: 0,
};
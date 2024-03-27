// This test is not intended to be run by JavaScript.
// This test is for static analysis of TypeScript and must be run by TypeScript-compiler to detect errors.

import { Model } from "hybrids";

export interface ISingleton {
    prop: string;
    length: number;
}

const SingletonStore: Model<ISingleton> = {
    prop: "",
    length: 0,
};

export default SingletonStore

const BrokenSingletonStore: Model<ISingleton> = {
    /// @ts-expect-error
    id: true,
    prop: "",
    length: 0,
};
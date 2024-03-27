// This test is not intended to be run by JavaScript.
// This test is for static analysis of TypeScript and must be run by TypeScript-compiler to detect errors.

import { Model } from "hybrids";
import ExampleSingletonStore, { IExampleSingleton } from "./example-singleton.store.test";
import ExampleEnumerableStore, { IExampleEnumerable } from "./example-enumerable.store.test";

interface ISomeObject {
    prop: string;
    length: number;
}

interface IModel {
    id: string;

    // boolean

    emptyBoolean: boolean;
    boolean: boolean;
    looseBoolean: boolean;
    undefinedOptionalBoolean?: boolean;
    optionalBoolean?: boolean;

    emptyCalculatedBoolean: boolean;
    calculatedBoolean: boolean;
    undefinedCalculatedBoolean: boolean;
    looseCalculatedBoolean: boolean;
    calculatedOptionalBoolean?: boolean;
    undefinedCalculatedOptionalBoolean?: boolean;

    // boolean List

    emptyBooleanList: boolean[];
    booleanList: boolean[];
    looseBooleanList: boolean[];
    undefinedOptionalBooleanList?: boolean[];
    optionalBooleanList?: boolean[];

    emptyCalculatedBooleanList: boolean[];
    calculatedBooleanList: boolean[];
    undefinedCalculatedBooleanList: boolean[];
    looseCalculatedBooleanList: boolean[];
    calculatedOptionalBooleanList?: boolean[];
    undefinedCalculatedOptionalBooleanList?: boolean[];

    // number

    emptyNumber: number;
    number: number;
    looseNumber: number;
    undefinedOptionalNumber?: number;
    optionalNumber?: number;

    emptyCalculatedNumber: number;
    calculatedNumber: number;
    undefinedCalculatedNumber: number;
    looseCalculatedNumber: number;
    calculatedOptionalNumber?: number;
    undefinedCalculatedOptionalNumber?: number;

    // number List

    emptyNumberList: number[];
    numberList: number[];
    looseNumberList: number[];
    undefinedOptionalNumberList?: number[];
    optionalNumberList?: number[];

    emptyCalculatedNumberList: number[];
    calculatedNumberList: number[];
    undefinedCalculatedNumberList: number[];
    looseCalculatedNumberList: number[];
    calculatedOptionalNumberList?: number[];
    undefinedCalculatedOptionalNumberList?: number[];

    // string

    emptyString: string;
    string: string;
    looseString: string;
    undefinedOptionalString?: string;
    optionalString?: string;

    emptyCalculatedString: string;
    calculatedString: string;
    undefinedCalculatedString: string;
    looseCalculatedString: string;
    calculatedOptionalString?: string;
    undefinedCalculatedOptionalString?: string;

    // string List

    emptyStringList: string[];
    stringList: string[];
    looseStringList: string[];
    undefinedOptionalStringList?: string[];
    optionalStringList?: string[];

    emptyCalculatedStringList: string[];
    calculatedStringList: string[];
    undefinedCalculatedStringList: string[];
    looseCalculatedStringList: string[];
    calculatedOptionalStringList?: string[];
    undefinedCalculatedOptionalStringList?: string[];

    // Object

    object: ISomeObject;
    looseObject: ISomeObject;
    undefinedOptionalObject?: ISomeObject;
    optionalObject?: ISomeObject;

    calculatedObject: ISomeObject;
    undefinedCalculatedObject: ISomeObject;
    looseCalculatedObject: ISomeObject;
    calculatedOptionalObject?: ISomeObject;
    undefinedCalculatedOptionalObject?: ISomeObject;

    // Object List

    objectList: ISomeObject[];
    looseObjectList: ISomeObject[];
    undefinedOptionalObjectList?: ISomeObject[];
    optionalObjectList?: ISomeObject[];

    calculatedObjectList: ISomeObject[];
    undefinedCalculatedObjectList: ISomeObject[];
    looseCalculatedObjectList: ISomeObject[];
    calculatedOptionalObjectList?: ISomeObject[];
    undefinedCalculatedOptionalObjectList?: ISomeObject[];

    // Enumerable Model

    enumerableModel: IExampleEnumerable;
    looseEnumerableModel: IExampleEnumerable;
    undefinedOptionalEnumerableModel?: IExampleEnumerable;
    optionalEnumerableModel?: IExampleEnumerable;

    calculatedEnumerableModel: IExampleEnumerable;
    undefinedCalculatedEnumerableModel: IExampleEnumerable;
    looseCalculatedEnumerableModel: IExampleEnumerable;
    calculatedOptionalEnumerableModel?: IExampleEnumerable;
    undefinedCalculatedOptionalEnumerableModel?: IExampleEnumerable;

    // Enumerable Model List

    enumerableModelList: IExampleEnumerable[];
    looseEnumerableModelList: IExampleEnumerable[];
    undefinedOptionalEnumerableModelList?: IExampleEnumerable[];
    optionalEnumerableModelList?: IExampleEnumerable[];

    calculatedEnumerableModelList: IExampleEnumerable[];
    undefinedCalculatedEnumerableModelList: IExampleEnumerable[];
    looseCalculatedEnumerableModelList: IExampleEnumerable[];
    calculatedOptionalEnumerableModelList?: IExampleEnumerable[];
    undefinedCalculatedOptionalEnumerableModelList?: IExampleEnumerable[];

    // Singleton Model

    singletonModel: IExampleSingleton;
    looseSingletonModel: IExampleSingleton;
    undefinedOptionalSingletonModel?: IExampleSingleton;
    optionalSingletonModel?: IExampleSingleton;

    calculatedSingletonModel: IExampleSingleton;
    undefinedCalculatedSingletonModel: IExampleSingleton;
    looseCalculatedSingletonModel: IExampleSingleton;
    calculatedOptionalSingletonModel?: IExampleSingleton;
    undefinedCalculatedOptionalSingletonModel?: IExampleSingleton;

    // Singleton Model List

    singletonModelList: IExampleSingleton[];
    looseSingletonModelList: IExampleSingleton[];
    undefinedOptionalSingletonModelList?: IExampleSingleton[];
    optionalSingletonModelList?: IExampleSingleton[];

    calculatedSingletonModelList: IExampleSingleton[];
    undefinedCalculatedSingletonModelList: IExampleSingleton[];
    looseCalculatedSingletonModelList: IExampleSingleton[];
    calculatedOptionalSingletonModelList?: IExampleSingleton[];
    undefinedCalculatedOptionalSingletonModelList?: IExampleSingleton[];
}

/// @ts-expect-error
const EmptyStore: Model<IModel> = {
    id: true,
    boolean: false,
};

let condition = false;

const ModelStore: Model<IModel> = {
    id: true,

    // boolean

    boolean: false,
    /// @ts-expect-error
    emptyBoolean: Boolean,
    optionalBoolean: false,
    /// @ts-expect-error
    undefinedOptionalBoolean: undefined,

    calculatedBoolean: () => false,
    /// @ts-expect-error
    undefinedCalculatedBoolean: () => undefined,
    /// @ts-expect-error
    emptyCalculatedBoolean: () => Boolean,
    calculatedOptionalBoolean: () => false,
    undefinedCalculatedOptionalBoolean: () => condition ? undefined : false,


    // boolean List

    booleanList: [false],
    emptyBooleanList: [Boolean],
    /// @ts-expect-error
    looseBooleanList: [false, { loose: true }],
    optionalBooleanList: [false],
    /// @ts-expect-error
    undefinedOptionalBooleanList: undefined,

    calculatedBooleanList: () => [false],
    /// @ts-expect-error
    undefinedCalculatedBooleanList: () => undefined,
    emptyCalculatedBooleanList: () => [Boolean],
    /// @ts-expect-error
    looseCalculatedBooleanList: () => [false, { loose: true }],
    calculatedOptionalBooleanList: () => [false],
    undefinedCalculatedOptionalBooleanList: () => condition ? undefined : [false],

    // number

    number: 0,
    /// @ts-expect-error
    emptyNumber: Number,
    optionalNumber: 0,
    /// @ts-expect-error
    undefinedOptionalNumber: undefined,

    calculatedNumber: () => 0,
    /// @ts-expect-error
    undefinedCalculatedNumber: () => undefined,
    /// @ts-expect-error
    emptyCalculatedNumber: () => Number,
    calculatedOptionalNumber: () => 0,
    undefinedCalculatedOptionalNumber: () => condition ? undefined : 0,

    // number List

    numberList: [0],
    emptyNumberList: [Number],
    /// @ts-expect-error
    looseNumberList: [0, { loose: true }],
    optionalNumberList: [0],
    /// @ts-expect-error
    undefinedOptionalNumberList: undefined,

    calculatedNumberList: () => [0],
    /// @ts-expect-error
    undefinedCalculatedNumberList: () => undefined,
    emptyCalculatedNumberList: () => [Number],
    /// @ts-expect-error
    looseCalculatedNumberList: () => [0, { loose: true }],
    calculatedOptionalNumberList: () => [0],
    undefinedCalculatedOptionalNumberList: () => condition ? undefined : [0],

    // string

    string: "",
    /// @ts-expect-error
    emptyString: String,
    optionalString: "",
    /// @ts-expect-error
    undefinedOptionalString: undefined,

    calculatedString: () => "",
    /// @ts-expect-error
    undefinedCalculatedString: () => undefined,
    /// @ts-expect-error
    emptyCalculatedString: () => String,
    calculatedOptionalString: () => "",
    undefinedCalculatedOptionalString: () => condition ? undefined : "",

    // string List

    stringList: [""],
    emptyStringList: [String],
    /// @ts-expect-error
    looseStringList: ["", { loose: true }],
    optionalStringList: [""],
    /// @ts-expect-error
    undefinedOptionalStringList: undefined,

    calculatedStringList: () => [""],
    /// @ts-expect-error
    undefinedCalculatedStringList: () => undefined,
    emptyCalculatedStringList: () => [String],
    /// @ts-expect-error
    looseCalculatedStringList: () => ["", { loose: true }],
    calculatedOptionalStringList: () => [""],
    undefinedCalculatedOptionalStringList: () => condition ? undefined : [""],

    // Object

    object: { prop: "", length: 0 },
    optionalObject: { prop: "", length: 0 },
    /// @ts-expect-error
    undefinedOptionalObject: undefined,

    calculatedObject: () => ({ prop: "", length: 0 }),
    /// @ts-expect-error
    undefinedCalculatedObject: () => undefined,
    calculatedOptionalObject: () => ({ prop: "", length: 0 }),
    undefinedCalculatedOptionalObject: () => condition ? undefined : ({ prop: "", length: 0 }),

    // Object List

    objectList: [{ prop: "", length: 0 }],
    /// @ts-expect-error
    looseObjectList: [{ prop: "", length: 0 }, { loose: true }],
    optionalObjectList: [{ prop: "", length: 0 }],
    /// @ts-expect-error
    undefinedOptionalObjectList: undefined,

    calculatedObjectList: () => [{ prop: "", length: 0 }],
    /// @ts-expect-error
    undefinedCalculatedObjectList: () => undefined,
    /// @ts-expect-error
    looseCalculatedObjectList: () => [{ prop: "", length: 0 }, { loose: true }],
    calculatedOptionalObjectList: () => [{ prop: "", length: 0 }],
    undefinedCalculatedOptionalObjectList: () => condition ? undefined : [{ prop: "", length: 0 }],

    // Enumerable Model

    enumerableModel: ExampleEnumerableStore,
    optionalEnumerableModel: ExampleEnumerableStore,
    /// @ts-expect-error
    undefinedOptionalEnumerableModel: undefined,

    calculatedEnumerableModel: () => ExampleEnumerableStore,
    /// @ts-expect-error
    undefinedCalculatedEnumerableModel: () => undefined,
    calculatedOptionalEnumerableModel: () => ExampleEnumerableStore,
    undefinedCalculatedOptionalEnumerableModel: () => condition ? undefined : ExampleEnumerableStore,

    // Enumerable Model List

    enumerableModelList: [ExampleEnumerableStore],
    looseEnumerableModelList: [ExampleEnumerableStore, { loose: true }],
    optionalEnumerableModelList: [ExampleEnumerableStore],
    /// @ts-expect-error
    undefinedOptionalEnumerableModelList: undefined,

    calculatedEnumerableModelList: () => [ExampleEnumerableStore],
    /// @ts-expect-error
    undefinedCalculatedEnumerableModelList: () => undefined,
    looseCalculatedEnumerableModelList: () => [ExampleEnumerableStore, { loose: true }],
    calculatedOptionalEnumerableModelList: () => [ExampleEnumerableStore],
    undefinedCalculatedOptionalEnumerableModelList: () => condition ? undefined : [ExampleEnumerableStore],

    // Singleton Model

    singletonModel: ExampleSingletonStore,
    optionalSingletonModel: ExampleSingletonStore,
    /// @ts-expect-error
    undefinedOptionalSingletonModel: undefined,

    calculatedSingletonModel: () => ExampleSingletonStore,
    /// @ts-expect-error
    undefinedCalculatedSingletonModel: () => undefined,
    calculatedOptionalSingletonModel: () => ExampleSingletonStore,
    undefinedCalculatedOptionalSingletonModel: () => condition ? undefined : ExampleSingletonStore,

    // Singleton Model List

    /// @ts-expect-error
    singletonModelList: [ExampleSingletonStore],
    /// @ts-expect-error
    looseSingletonModelList: [ExampleSingletonStore, { loose: true }],
    /// @ts-expect-error
    optionalSingletonModelList: [ExampleSingletonStore],
    /// @ts-expect-error
    undefinedOptionalSingletonModelList: undefined,

    /// @ts-expect-error
    calculatedSingletonModelList: () => [ExampleSingletonStore],
    /// @ts-expect-error
    undefinedCalculatedSingletonModelList: () => undefined,
    /// @ts-expect-error
    looseCalculatedSingletonModelList: () => [ExampleSingletonStore, { loose: true }],
    /// @ts-expect-error
    calculatedOptionalSingletonModelList: () => [ExampleSingletonStore],
    /// @ts-expect-error
    undefinedCalculatedOptionalSingletonModelList: () => condition ? undefined : [ExampleSingletonStore],
};

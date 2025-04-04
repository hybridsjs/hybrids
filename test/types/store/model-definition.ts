import { IEnumerable } from "./.internals/enumerable/enumerable.entity";
import { Enumerable } from "./.internals/enumerable/enumerable.store";
import { ISingleton } from "./.internals/singleton/singleton.entity";
import { Singleton } from "./.internals/singleton/singleton.store";
import { Model } from "/types/index";

interface ISomeObject {
  prop: string;
  length: number;
}

let condition = false;

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

  enumerableModel: IEnumerable;
  looseEnumerableModel: IEnumerable;
  undefinedOptionalEnumerableModel?: IEnumerable;
  optionalEnumerableModel?: IEnumerable;

  calculatedEnumerableModel: IEnumerable;
  undefinedCalculatedEnumerableModel: IEnumerable;
  looseCalculatedEnumerableModel: IEnumerable;
  calculatedOptionalEnumerableModel?: IEnumerable;
  undefinedCalculatedOptionalEnumerableModel?: IEnumerable;

  // Enumerable Model List

  enumerableModelList: IEnumerable[];
  looseEnumerableModelList: IEnumerable[];
  undefinedOptionalEnumerableModelList?: IEnumerable[];
  optionalEnumerableModelList?: IEnumerable[];

  calculatedEnumerableModelList: IEnumerable[];
  undefinedCalculatedEnumerableModelList: IEnumerable[];
  looseCalculatedEnumerableModelList: IEnumerable[];
  calculatedOptionalEnumerableModelList?: IEnumerable[];
  undefinedCalculatedOptionalEnumerableModelList?: IEnumerable[];

  // Singleton Model

  singletonModel: ISingleton;
  looseSingletonModel: ISingleton;
  undefinedOptionalSingletonModel?: ISingleton;
  optionalSingletonModel?: ISingleton;

  calculatedSingletonModel: ISingleton;
  undefinedCalculatedSingletonModel: ISingleton;
  looseCalculatedSingletonModel: ISingleton;
  calculatedOptionalSingletonModel?: ISingleton;
  undefinedCalculatedOptionalSingletonModel?: ISingleton;

  // Singleton Model List

  singletonModelList: ISingleton[];
  looseSingletonModelList: ISingleton[];
  undefinedOptionalSingletonModelList?: ISingleton[];
  optionalSingletonModelList?: ISingleton[];

  calculatedSingletonModelList: ISingleton[];
  undefinedCalculatedSingletonModelList: ISingleton[];
  looseCalculatedSingletonModelList: ISingleton[];
  calculatedOptionalSingletonModelList?: ISingleton[];
  undefinedCalculatedOptionalSingletonModelList?: ISingleton[];
}

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
  undefinedCalculatedOptionalBoolean: () => (condition ? undefined : false),

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
  undefinedCalculatedOptionalBooleanList: () =>
    condition ? undefined : [false],

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
  undefinedCalculatedOptionalNumber: () => (condition ? undefined : 0),

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
  undefinedCalculatedOptionalNumberList: () => (condition ? undefined : [0]),

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
  undefinedCalculatedOptionalString: () => (condition ? undefined : ""),

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
  undefinedCalculatedOptionalStringList: () => (condition ? undefined : [""]),

  // Object

  object: { prop: "", length: 0 },
  optionalObject: { prop: "", length: 0 },
  /// @ts-expect-error
  undefinedOptionalObject: undefined,

  calculatedObject: () => ({ prop: "", length: 0 }),
  /// @ts-expect-error
  undefinedCalculatedObject: () => undefined,
  calculatedOptionalObject: () => ({ prop: "", length: 0 }),
  undefinedCalculatedOptionalObject: () =>
    condition ? undefined : { prop: "", length: 0 },

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
  undefinedCalculatedOptionalObjectList: () =>
    condition ? undefined : [{ prop: "", length: 0 }],

  // Enumerable Model

  enumerableModel: Enumerable,
  optionalEnumerableModel: Enumerable,
  /// @ts-expect-error
  undefinedOptionalEnumerableModel: undefined,

  calculatedEnumerableModel: () => Enumerable,
  /// @ts-expect-error
  undefinedCalculatedEnumerableModel: () => undefined,
  calculatedOptionalEnumerableModel: () => Enumerable,
  undefinedCalculatedOptionalEnumerableModel: () =>
    condition ? undefined : Enumerable,

  // Enumerable Model List

  enumerableModelList: [Enumerable],
  looseEnumerableModelList: [Enumerable, { loose: true }],
  optionalEnumerableModelList: [Enumerable],
  /// @ts-expect-error
  undefinedOptionalEnumerableModelList: undefined,

  calculatedEnumerableModelList: () => [Enumerable],
  /// @ts-expect-error
  undefinedCalculatedEnumerableModelList: () => undefined,
  looseCalculatedEnumerableModelList: () => [Enumerable, { loose: true }],
  calculatedOptionalEnumerableModelList: () => [Enumerable],
  undefinedCalculatedOptionalEnumerableModelList: () =>
    condition ? undefined : [Enumerable],

  // Singleton Model

  singletonModel: Singleton,
  optionalSingletonModel: Singleton,
  /// @ts-expect-error
  undefinedOptionalSingletonModel: undefined,

  calculatedSingletonModel: () => Singleton,
  /// @ts-expect-error
  undefinedCalculatedSingletonModel: () => undefined,
  calculatedOptionalSingletonModel: () => Singleton,
  undefinedCalculatedOptionalSingletonModel: () =>
    condition ? undefined : Singleton,

  // Singleton Model List

  /// @ts-expect-error
  singletonModelList: [Singleton],
  /// @ts-expect-error
  looseSingletonModelList: [Singleton, { loose: true }],
  /// @ts-expect-error
  optionalSingletonModelList: [Singleton],
  /// @ts-expect-error
  undefinedOptionalSingletonModelList: undefined,

  /// @ts-expect-error
  calculatedSingletonModelList: () => [Singleton],
  /// @ts-expect-error
  undefinedCalculatedSingletonModelList: () => undefined,
  /// @ts-expect-error
  looseCalculatedSingletonModelList: () => [Singleton, { loose: true }],
  /// @ts-expect-error
  calculatedOptionalSingletonModelList: () => [Singleton],
  /// @ts-expect-error
  undefinedCalculatedOptionalSingletonModelList: () =>
    condition ? undefined : [Singleton],
};

export default ModelStore;

/// @ts-expect-error
const EmptyStore: Model<IModel> = {
  id: true,
  boolean: false,
};

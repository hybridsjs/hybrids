import { IEnumerable } from "./.internals/enumerable/enumerable.entity";
import { Enumerable } from "./.internals/enumerable/enumerable.store";
import { ISingleton } from "./.internals/singleton/singleton.entity";
import { Singleton } from "./.internals/singleton/singleton.store";
import { Model, store } from "/types/index";

interface ICasesOfFieldsWithValues<T> {
  // value = value
  fieldWithDefaultValue: T;
  fieldCalculatedAsValue: T;
  optionalFieldWithDefaultValue?: T;
  optionalFieldCalculatedAsValue?: T;
}

interface ICasesOfListedFieldsWithValues<T> {
  // value[] = value[]
  listedFieldWithDefaultValues: T[];
  listedFieldCalculatedAsValues: T[];
  listedOptionalFieldWithDefaultValues?: T[];
  listedOptionalFieldCalculatedAsValues?: T[];
}

interface ICasesOfFieldsWithEmptyValues<T> {
  // value = Empty
  fieldWithDefaultEmptyValue: T;
  fieldCalculatedAsEmptyValue: T;
  optionalFieldWithDefaultEmptyValue?: T;
  optionalFieldCalculatedAsEmptyValue?: T;
}

interface ICasesOfListedFieldsWithEmptyValues<T> {
  // value[] = [Empty]
  listedFieldWithDefaultEmptyValues: T[];
  listedFieldCalculatedAsEmptyValues: T[];
  listedOptionalFieldWithDefaultEmptyValues?: T[];
  listedOptionalFieldCalculatedAsEmptyValues?: T[];
}

interface ICasesOfListedFieldsWithLoosedValues<T> {
  // value[] = [value, { loose }]
  loosedListedFieldWithDefaultEmptyValue: T[]
  loosedListedFieldCalculatedAsEmptyValue?: T[]
  loosedListedOptionalFieldWithDefaultEmptyValue: T[]
  loosedListedOptionalFieldCalculatedAsEmptyValue?: T[]
}

interface ICasesOfFieldsWithUndefinedValues<T> {
  // value = undefined
  fieldWithDefaultUndefinedValue: T;
  fieldCalculatedAsUndefinedValue: T;
  optionalFieldWithDefaultUndefinedValue?: T;
  optionalFieldCalculatedAsUndefinedValue?: T;
}

interface ICasesOfListedFieldsWithUndefinedValues<T> {
  // value[] = undefined[]
  listedFieldWithDefaultUndefinedValues: T[];
  listedFieldCalculatedAsUndefinedValues: T[];
  listedOptionalFieldWithDefaultUndefinedValues?: T[];
  listedOptionalFieldCalculatedAsUndefinedValues?: T[];
}

interface IPrimitivePositiveCases extends ICasesOfFieldsWithValues<boolean>, ICasesOfListedFieldsWithValues<boolean>, ICasesOfListedFieldsWithEmptyValues<boolean> {}
interface IPrimitiveNegativeCases extends ICasesOfFieldsWithEmptyValues<boolean>, ICasesOfListedFieldsWithLoosedValues<boolean>, ICasesOfFieldsWithUndefinedValues<boolean>, ICasesOfListedFieldsWithUndefinedValues<boolean> {}

const PrimitivePositiveCases: Model<IPrimitivePositiveCases> = {
  // boolean = boolean
  fieldWithDefaultValue: false,
  fieldCalculatedAsValue: ({ fieldWithDefaultValue }) => fieldWithDefaultValue,
  optionalFieldWithDefaultValue: false,
  optionalFieldCalculatedAsValue: ({ optionalFieldWithDefaultValue }) => optionalFieldWithDefaultValue || false,

  // boolean[] = boolean[]
  listedFieldWithDefaultValues: [false],
  listedFieldCalculatedAsValues: ({ listedFieldWithDefaultValues }) => listedFieldWithDefaultValues,
  listedOptionalFieldWithDefaultValues: [false],
  listedOptionalFieldCalculatedAsValues: ({ listedOptionalFieldWithDefaultValues }) => listedOptionalFieldWithDefaultValues,

  // boolean[] = [Boolean]
  listedFieldWithDefaultEmptyValues: [Boolean],
  listedFieldCalculatedAsEmptyValues: ({ listedFieldWithDefaultEmptyValues }) => listedFieldWithDefaultEmptyValues && [Boolean],
  listedOptionalFieldWithDefaultEmptyValues: [Boolean],
  listedOptionalFieldCalculatedAsEmptyValues: ({ listedOptionalFieldWithDefaultEmptyValues }) => listedOptionalFieldWithDefaultEmptyValues && [Boolean],
}

const PrimitiveNegativeCases: Model<IPrimitiveNegativeCases> = {
  // boolean = Boolean
  /// @ts-expect-error
  fieldWithDefaultEmptyValue: Boolean,
  /// @ts-expect-error
  fieldCalculatedAsEmptyValue: ({ fieldWithDefaultEmptyValue }) => fieldWithDefaultEmptyValue && Boolean,
  /// @ts-expect-error
  optionalFieldWithDefaultEmptyValue: Boolean,
  /// @ts-expect-error
  optionalFieldCalculatedAsEmptyValue: ({ optionalFieldWithDefaultEmptyValue }) => optionalFieldWithDefaultEmptyValue && Boolean,
  
  // boolean[] = [Boolean, { loose }]
  /// @ts-expect-error
  loosedListedFieldWithDefaultEmptyValue: [Boolean, { loose: true }],
  /// @ts-expect-error
  loosedListedFieldCalculatedAsEmptyValue: ({ loosedListedFieldWithDefaultEmptyValue: loosedListedFieldWithDefaultUndefinedValues }) => loosedListedFieldWithDefaultUndefinedValues && [Boolean, { loose: true }],
  /// @ts-expect-error
  loosedListedOptionalFieldWithDefaultEmptyValue: [Boolean, { loose: true }],
  /// @ts-expect-error
  loosedListedOptionalFieldCalculatedAsEmptyValue: ({ loosedListedOptionalFieldWithDefaultEmptyValue: loosedListedOptionalFieldWithDefaultUndefinedValues }) => loosedListedOptionalFieldWithDefaultUndefinedValues && [Boolean, { loose: true }],
  
  // boolean = undefined
  /// @ts-expect-error
  fieldWithDefaultUndefinedValue: undefined,
  /// @ts-expect-error
  fieldCalculatedAsUndefinedValue: ({ fieldWithDefaultUndefinedValue }) => fieldWithDefaultUndefinedValue && undefined,
  /// @ts-expect-error
  optionalFieldWithDefaultUndefinedValue: undefined,
  /// @ts-expect-error
  optionalFieldCalculatedAsUndefinedValue: ({ optionalFieldWithDefaultUndefinedValue }) => optionalFieldWithDefaultUndefinedValue && undefined,

  // boolean[] = undefined[]
  /// @ts-expect-error
  listedFieldWithDefaultUndefinedValues: [undefined],
  /// @ts-expect-error
  listedFieldCalculatedAsUndefinedValues: ({ listedFieldWithDefaultUndefinedValues }) => listedFieldWithDefaultUndefinedValues && [undefined],
  /// @ts-expect-error
  listedOptionalFieldWithDefaultUndefinedValues: [undefined],
  /// @ts-expect-error
  listedOptionalFieldCalculatedAsUndefinedValues: ({ listedOptionalFieldWithDefaultUndefinedValues }) => listedOptionalFieldWithDefaultUndefinedValues && [undefined],
}

interface ISomeObject {
  stringProperty: string,
  numberProperty: number,
}
interface IObjectPositiveCases extends ICasesOfFieldsWithValues<ISomeObject>, ICasesOfListedFieldsWithValues<ISomeObject> {}
interface IObjectNegativeCases extends ICasesOfFieldsWithEmptyValues<ISomeObject>, ICasesOfListedFieldsWithEmptyValues<ISomeObject>, ICasesOfListedFieldsWithLoosedValues<ISomeObject>, ICasesOfFieldsWithUndefinedValues<ISomeObject>, ICasesOfListedFieldsWithUndefinedValues<ISomeObject> {}

const someObject: ISomeObject = {
  stringProperty: "",
  numberProperty: 1,
}

const ObjectPositiveCases: Model<IObjectPositiveCases> = {
  // ISomeObject = someObject
  fieldWithDefaultValue: someObject,
  fieldCalculatedAsValue: ({ fieldWithDefaultValue }) => fieldWithDefaultValue,
  optionalFieldWithDefaultValue: someObject,
  optionalFieldCalculatedAsValue: ({ optionalFieldWithDefaultValue }) => optionalFieldWithDefaultValue,

  // ISomeObject[] = someObject[]
  listedFieldWithDefaultValues: [someObject, someObject],
  listedFieldCalculatedAsValues: ({ listedFieldWithDefaultValues }) => listedFieldWithDefaultValues,
  listedOptionalFieldWithDefaultValues: [someObject, someObject],
  listedOptionalFieldCalculatedAsValues: ({ listedOptionalFieldWithDefaultValues }) => listedOptionalFieldWithDefaultValues,
}

const ObjectNegativeCases: Model<IObjectNegativeCases> = {
  // ISomeObject = Object
  /// @ts-expect-error
  fieldWithDefaultEmptyValue: Object,
  /// @ts-expect-error
  fieldCalculatedAsEmptyValue: ({ fieldWithDefaultEmptyValue }) => fieldWithDefaultEmptyValue && Object,
  /// @ts-expect-error
  optionalFieldWithDefaultEmptyValue: Object,
  /// @ts-expect-error
  optionalFieldCalculatedAsEmptyValue: ({ optionalFieldWithDefaultEmptyValue }) => optionalFieldWithDefaultEmptyValue && Object,

  // ISomeObject[] = [Object]
  /// @ts-expect-error
  listedFieldWithDefaultEmptyValues: [Object],
  /// @ts-expect-error
  listedFieldCalculatedAsEmptyValues: ({ listedFieldWithDefaultEmptyValues }) => listedFieldWithDefaultEmptyValues && [Object],
  /// @ts-expect-error
  listedOptionalFieldWithDefaultEmptyValues: [Object],
  /// @ts-expect-error
  listedOptionalFieldCalculatedAsEmptyValues: ({ listedOptionalFieldWithDefaultEmptyValues }) => listedOptionalFieldWithDefaultEmptyValues && [Object],
  
  // ISomeObject[] = [Object, { loose }]
  /// @ts-expect-error
  loosedListedFieldWithDefaultEmptyValue: [Object, { loose: true }],
  /// @ts-expect-error
  loosedListedFieldCalculatedAsEmptyValue: ({ loosedListedFieldWithDefaultEmptyValue }) => loosedListedFieldWithDefaultEmptyValue && [Object, { loose: true }],
  /// @ts-expect-error
  loosedListedOptionalFieldWithDefaultEmptyValue: [Object, { loose: true }],
  /// @ts-expect-error
  loosedListedOptionalFieldCalculatedAsEmptyValue: ({ loosedListedOptionalFieldWithDefaultEmptyValue }) => loosedListedOptionalFieldWithDefaultEmptyValue && [Object, { loose: true }],
  
  // ISomeObject = undefined
  /// @ts-expect-error
  fieldWithDefaultUndefinedValue: undefined,
  /// @ts-expect-error
  fieldCalculatedAsUndefinedValue: ({ fieldWithDefaultUndefinedValue }) => fieldWithDefaultUndefinedValue && undefined,
  /// @ts-expect-error
  optionalFieldWithDefaultUndefinedValue: undefined,
  /// @ts-expect-error
  optionalFieldCalculatedAsUndefinedValue: ({ optionalFieldWithDefaultUndefinedValue }) => optionalFieldWithDefaultUndefinedValue && undefined,

  // ISomeObject[] = undefined[]
  /// @ts-expect-error
  listedFieldWithDefaultUndefinedValues: [undefined],
  /// @ts-expect-error
  listedFieldCalculatedAsUndefinedValues: ({ listedFieldWithDefaultUndefinedValues }) => listedFieldWithDefaultUndefinedValues && [undefined],
  /// @ts-expect-error
  listedOptionalFieldWithDefaultUndefinedValues: [undefined],
  /// @ts-expect-error
  listedOptionalFieldCalculatedAsUndefinedValues: ({ listedOptionalFieldWithDefaultUndefinedValues }) => listedOptionalFieldWithDefaultUndefinedValues && [undefined],
}

interface ISingletonPositiveCases extends ICasesOfFieldsWithEmptyValues<ISingleton> {}
interface ISingletonNegativeCases extends ICasesOfFieldsWithValues<ISingleton>, ICasesOfListedFieldsWithValues<ISingleton>, ICasesOfListedFieldsWithEmptyValues<ISingleton>, ICasesOfListedFieldsWithLoosedValues<ISingleton>, ICasesOfFieldsWithUndefinedValues<ISingleton>, ICasesOfListedFieldsWithUndefinedValues<ISingleton> {}

const singleton = store.sync(Singleton, {})

const SingletonPositiveCases: Model<ISingletonPositiveCases> = {
  // ISingleton = Singleton
  fieldWithDefaultEmptyValue: Singleton,
  fieldCalculatedAsEmptyValue: ({ fieldWithDefaultEmptyValue }) => fieldWithDefaultEmptyValue && Singleton,
  optionalFieldWithDefaultEmptyValue: Singleton,
  optionalFieldCalculatedAsEmptyValue: ({ optionalFieldWithDefaultEmptyValue }) => optionalFieldWithDefaultEmptyValue && Singleton,
}

const SingletonNegativeCases: Model<ISingletonNegativeCases> = {
  // ISingleton = singleton
  /// @ts-expect-error
  fieldWithDefaultValue: singleton,
  /// @ts-expect-error
  fieldCalculatedAsValue: ({ fieldWithDefaultValue }) => fieldWithDefaultValue,
  /// @ts-expect-error
  optionalFieldWithDefaultValue: singleton,
  /// @ts-expect-error
  optionalFieldCalculatedAsValue: ({ optionalFieldWithDefaultValue }) => optionalFieldWithDefaultValue,

  // ISingleton[] = singleton[]
  /// @ts-expect-error
  listedFieldWithDefaultValues: [singleton, singleton],
  /// @ts-expect-error
  listedFieldCalculatedAsValues: ({ listedFieldWithDefaultValues }) => listedFieldWithDefaultValues,
  /// @ts-expect-error
  listedOptionalFieldWithDefaultValues: [singleton, singleton],
  /// @ts-expect-error
  listedOptionalFieldCalculatedAsValues: ({ listedOptionalFieldWithDefaultValues }) => listedOptionalFieldWithDefaultValues,

  // ISingleton[] = [Singleton]
  /// @ts-expect-error
  listedFieldWithDefaultEmptyValues: [Singleton],
  /// @ts-expect-error
  listedFieldCalculatedAsEmptyValues: ({ listedFieldWithDefaultEmptyValues }) => listedFieldWithDefaultEmptyValues && [Singleton],
  /// @ts-expect-error
  listedOptionalFieldWithDefaultEmptyValues: [Singleton],
  /// @ts-expect-error
  listedOptionalFieldCalculatedAsEmptyValues: ({ listedOptionalFieldWithDefaultEmptyValues }) => listedOptionalFieldWithDefaultEmptyValues && [Singleton],
  
  // ISingleton[] = [Singleton, { loose }]
  /// @ts-expect-error
  loosedListedFieldWithDefaultEmptyValue: [Singleton, { loose: true }],
  /// @ts-expect-error
  loosedListedFieldCalculatedAsEmptyValue: ({ loosedListedFieldWithDefaultEmptyValue }) => loosedListedFieldWithDefaultEmptyValue && [Singleton, { loose: true }],
  /// @ts-expect-error
  loosedListedOptionalFieldWithDefaultEmptyValue: [Singleton, { loose: true }],
  /// @ts-expect-error
  loosedListedOptionalFieldCalculatedAsEmptyValue: ({ loosedListedOptionalFieldWithDefaultEmptyValue }) => loosedListedOptionalFieldWithDefaultEmptyValue && [Singleton, { loose: true }],
  
  // ISingleton = undefined
  /// @ts-expect-error
  fieldWithDefaultUndefinedValue: undefined,
  /// @ts-expect-error
  fieldCalculatedAsUndefinedValue: ({ fieldWithDefaultUndefinedValue }) => fieldWithDefaultUndefinedValue && undefined,
  /// @ts-expect-error
  optionalFieldWithDefaultUndefinedValue: undefined,
  /// @ts-expect-error
  optionalFieldCalculatedAsUndefinedValue: ({ optionalFieldWithDefaultUndefinedValue }) => optionalFieldWithDefaultUndefinedValue && undefined,

  // ISingleton[] = undefined[]
  /// @ts-expect-error
  listedFieldWithDefaultUndefinedValues: [undefined],
  /// @ts-expect-error
  listedFieldCalculatedAsUndefinedValues: ({ listedFieldWithDefaultUndefinedValues }) => listedFieldWithDefaultUndefinedValues && [undefined],
  /// @ts-expect-error
  listedOptionalFieldWithDefaultUndefinedValues: [undefined],
  /// @ts-expect-error
  listedOptionalFieldCalculatedAsUndefinedValues: ({ listedOptionalFieldWithDefaultUndefinedValues }) => listedOptionalFieldWithDefaultUndefinedValues && [undefined],
}

interface IEnumerablePositiveCases extends ICasesOfFieldsWithEmptyValues<IEnumerable>, ICasesOfListedFieldsWithEmptyValues<IEnumerable>, ICasesOfListedFieldsWithLoosedValues<IEnumerable> {}
interface IEnumerableNegativeCases extends ICasesOfFieldsWithValues<IEnumerable>, ICasesOfListedFieldsWithValues<IEnumerable>, ICasesOfFieldsWithUndefinedValues<IEnumerable>, ICasesOfListedFieldsWithUndefinedValues<IEnumerable> {}

const enumerable = store.sync(Enumerable, {})

const EnumerablePositiveCases: Model<IEnumerablePositiveCases> = {
  // IEnumerable = Enumerable
  fieldWithDefaultEmptyValue: Enumerable,
  fieldCalculatedAsEmptyValue: ({ fieldWithDefaultEmptyValue }) => fieldWithDefaultEmptyValue && Enumerable,
  optionalFieldWithDefaultEmptyValue: Enumerable,
  optionalFieldCalculatedAsEmptyValue: ({ optionalFieldWithDefaultEmptyValue }) => optionalFieldWithDefaultEmptyValue && Enumerable,

  // IEnumerable[] = [Enumerable]
  listedFieldWithDefaultEmptyValues: [Enumerable],
  listedFieldCalculatedAsEmptyValues: ({ listedFieldWithDefaultEmptyValues }) => listedFieldWithDefaultEmptyValues && [Enumerable],
  listedOptionalFieldWithDefaultEmptyValues: [Enumerable],
  listedOptionalFieldCalculatedAsEmptyValues: ({ listedOptionalFieldWithDefaultEmptyValues }) => listedOptionalFieldWithDefaultEmptyValues && [Enumerable],
  
  // IEnumerable[] = [Enumerable, { loose }]
  loosedListedFieldWithDefaultEmptyValue: [Enumerable, { loose: true }],
  loosedListedFieldCalculatedAsEmptyValue: ({ loosedListedFieldWithDefaultEmptyValue }) => loosedListedFieldWithDefaultEmptyValue && [Enumerable, { loose: true }],
  loosedListedOptionalFieldWithDefaultEmptyValue: [Enumerable, { loose: true }],
  loosedListedOptionalFieldCalculatedAsEmptyValue: ({ loosedListedOptionalFieldWithDefaultEmptyValue }) => loosedListedOptionalFieldWithDefaultEmptyValue && [Enumerable, { loose: true }],
}

const EnumerableNegativeCases: Model<IEnumerableNegativeCases> = {
  // IEnumerable = enumerable
  /// @ts-expect-error
  fieldWithDefaultValue: enumerable,
  /// @ts-expect-error
  fieldCalculatedAsValue: ({ fieldWithDefaultValue }) => fieldWithDefaultValue,
  /// @ts-expect-error
  optionalFieldWithDefaultValue: enumerable,
  /// @ts-expect-error
  optionalFieldCalculatedAsValue: ({ optionalFieldWithDefaultValue }) => optionalFieldWithDefaultValue,

  // IEnumerable[] = enumerable[]
  /// @ts-expect-error
  listedFieldWithDefaultValues: [enumerable, enumerable],
  /// @ts-expect-error
  listedFieldCalculatedAsValues: ({ listedFieldWithDefaultValues }) => listedFieldWithDefaultValues,
  /// @ts-expect-error
  listedOptionalFieldWithDefaultValues: [enumerable, enumerable],
  /// @ts-expect-error
  listedOptionalFieldCalculatedAsValues: ({ listedOptionalFieldWithDefaultValues }) => listedOptionalFieldWithDefaultValues,
  
  // IEnumerable = undefined
  /// @ts-expect-error
  fieldWithDefaultUndefinedValue: undefined,
  /// @ts-expect-error
  fieldCalculatedAsUndefinedValue: ({ fieldWithDefaultUndefinedValue }) => fieldWithDefaultUndefinedValue && undefined,
  /// @ts-expect-error
  optionalFieldWithDefaultUndefinedValue: undefined,
  /// @ts-expect-error
  optionalFieldCalculatedAsUndefinedValue: ({ optionalFieldWithDefaultUndefinedValue }) => optionalFieldWithDefaultUndefinedValue && undefined,

  // IEnumerable[] = undefined[]
  /// @ts-expect-error
  listedFieldWithDefaultUndefinedValues: [undefined],
  /// @ts-expect-error
  listedFieldCalculatedAsUndefinedValues: ({ listedFieldWithDefaultUndefinedValues }) => listedFieldWithDefaultUndefinedValues && [undefined],
  /// @ts-expect-error
  listedOptionalFieldWithDefaultUndefinedValues: [undefined],
  /// @ts-expect-error
  listedOptionalFieldCalculatedAsUndefinedValues: ({ listedOptionalFieldWithDefaultUndefinedValues }) => listedOptionalFieldWithDefaultUndefinedValues && [undefined],
}

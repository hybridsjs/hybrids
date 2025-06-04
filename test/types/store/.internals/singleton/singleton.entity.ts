import { INestedEnumerable } from "../nested-enumerable/nested-enumerable.entity";

export interface ISingleton {
  stringProperty: string;
  numberProperty: number;
  self: ISingleton
  nestedSingleton: ISingleton;
  optionalNestedSingleton?: ISingleton;
  nestedEnumerable: INestedEnumerable;
  optionalNestedEnumerable?: INestedEnumerable;
  nestedEnumerables: INestedEnumerable[]
}

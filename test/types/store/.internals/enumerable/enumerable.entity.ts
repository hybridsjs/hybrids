import { INestedEnumerable } from "../nested-enumerable/nested-enumerable.entity";
import { ISingleton } from "../singleton/singleton.entity";

export interface IEnumerable {
  id: string;
  stringProperty: string;
  numberProperty: number;
  self: IEnumerable;
  nestedSingleton: ISingleton;
  optionalNestedSingleton?: ISingleton;
  nestedEnumerable: INestedEnumerable;
  optionalNestedEnumerable?: INestedEnumerable;
  nestedEnumerables: INestedEnumerable[];
}

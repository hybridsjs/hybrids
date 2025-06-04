import { IDeepNestedEnumerable } from "../deep-nested-enumerable/deep-nested-enumerable.entity"
import { ISingleton } from "../singleton/singleton.entity";

export interface INestedEnumerable {
    id: string
    stringProperty: string;
    numberProperty: number;
    nestedSingleton: ISingleton;
    optionalNestedSingleton?: ISingleton;
    nestedEnumerable: IDeepNestedEnumerable;
    optionalNestedEnumerable?: IDeepNestedEnumerable;
    nestedEnumerables: IDeepNestedEnumerable[];
}
import { ILeaf } from "../leaf/leaf.entity"

export interface IBranch {
    id: string
    leaf: ILeaf
}
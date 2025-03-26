import { WoodFromMemory } from "../wood/wood-from-memory.store";
import { ISingleton } from "./singleton.entity";
import { Model } from "/types";

export const SingletonFromMemory: Model<ISingleton> = {
    wood: WoodFromMemory
}
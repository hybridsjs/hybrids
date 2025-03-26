import { WoodFromStorage } from "../wood/wood-from-storage.store";
import { ISingleton } from "./singleton.entity";
import { Model, store } from "/types";

let storage: ISingleton = {}

export const SingletonFromStorage: Model<ISingleton> = {
    wood: WoodFromStorage,
    [store.connect]: {
        get: async () => storage,
        set: async (_, values) => {
            storage = Object.assign(storage, values)
            return storage
        },
    }
}
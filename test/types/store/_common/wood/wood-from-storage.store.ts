import { BranchFromStorage } from "../branch/branch-from-storage.store";
import { IWood } from "./wood.entity";
import { Model, ModelIdentifier, store } from "/types";

const storage = new Map<ModelIdentifier, IWood>()

export const WoodFromStorage: Model<IWood> = {
  id: true,
  branch: BranchFromStorage,
  [store.connect]: {
    get: async (id) => storage.get(id),
    set: async (id, values) => {
        if (values) {
            if (typeof id !== "string") throw new TypeError()
            return storage.set(id, { ...values, id}).get(id)
        } else {
            storage.delete(id)
            return undefined
        }
    },
  }
}
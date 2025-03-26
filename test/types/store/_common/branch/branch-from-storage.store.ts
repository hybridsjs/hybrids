import { LeafFromStorage } from "../leaf/leaf-from-storage.store";
import { IBranch } from "./branch.entity";
import { Model, ModelIdentifier, store } from "/types";

const storage = new Map<ModelIdentifier, IBranch>()

export const BranchFromStorage: Model<IBranch> = {
  id: true,
  leaf: LeafFromStorage,
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
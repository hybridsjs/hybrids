import { ILeaf } from "./leaf.entity";
import { Model, ModelIdentifier, store } from "/types";

const storage = new Map<ModelIdentifier, ILeaf>()

export const LeafFromStorage: Model<ILeaf> = {
  id: true,
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
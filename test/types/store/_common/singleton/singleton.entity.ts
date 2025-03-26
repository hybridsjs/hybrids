import { IWood } from "../wood/wood.entity"
import { SingletonFromMemory } from "./singleton-from-memory.store"
import { store } from "/types"

export interface ISingleton {
  wood?: IWood
}

export const singleton = store.sync(SingletonFromMemory, {})

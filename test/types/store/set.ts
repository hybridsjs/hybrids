import { LeafFromMemory } from "./_common/leaf/leaf-from-memory.store"
import { BranchFromMemory } from "./_common/branch/branch-from-memory.store"
import { WoodFromMemory } from "./_common/wood/wood-from-memory.store"
import { SingletonFromMemory } from "./_common/singleton/singleton-from-memory.store"
import { store } from "/types"
import { IWood } from "./_common/wood/wood.entity"
import { ISingleton, singleton } from "./_common/singleton/singleton.entity"

const leaf = store.sync(LeafFromMemory, { id: "1" })
const branch = store.sync(BranchFromMemory, { id: "1" })
const wood = store.sync(WoodFromMemory, { id: "1" })

// #####################################################
// Overload for working with Definition

let woodInput: Promise<IWood>
let singletonInput: Promise<ISingleton>

{
  // Create...

  // Create model via Definition

  woodInput = store.set(WoodFromMemory, { branch: branch })
  woodInput = store.set(WoodFromMemory, { branch: "1" })

  // Create model & nested via Definition

  woodInput = store.set(WoodFromMemory, { branch: { leaf: leaf } })
  singletonInput = store.set(SingletonFromMemory, { wood: { leaf: leaf } })

  // Update...

  // Update model via Definition

  woodInput = store.set(WoodFromMemory, { id: "1", branch: branch })
  woodInput = store.set(WoodFromMemory, { id: "1", branch: "1" })
  singletonInput = store.set(SingletonFromMemory, { wood: branch })
  singletonInput = store.set(SingletonFromMemory, { wood: "1" })

  // Update model & nested via Definition

  woodInput = store.set(WoodFromMemory, { id: "1", branch: { id: "1", leaf: leaf } })
  woodInput = store.set(WoodFromMemory, { id: "1", branch: { id: "1", leaf: "1" } })
  singletonInput = store.set(SingletonFromMemory, { wood: { id: "1", leaf: leaf } })
  singletonInput = store.set(SingletonFromMemory, { wood: { id: "1", leaf: "1" } })

  // Delete...

  /// @ts-expect-error
  woodInput = store.set(WoodFromMemory, null)

  singletonInput = store.set(SingletonFromMemory, null)
  
  // Mixed...

  // Create model and Update nested via Definition

  woodInput = store.set(WoodFromMemory, { branch: { id: "1", leaf: leaf } })
  woodInput = store.set(WoodFromMemory, { branch: { id: "1", leaf: "1" } })

  // Update model and Create nested via Definition

  woodInput = store.set(WoodFromMemory, { id: "1", branch: { leaf: leaf } })
  woodInput = store.set(WoodFromMemory, { id: "1", branch: { leaf: "1" } })
}

// #####################################################
// Overload for working with instance

{
  // Create... x

  // Update...

  // Update model via instance

  store.set(wood, { branch: branch })
  store.set(wood, { branch: "1" })
  store.set(singleton, { wood: wood })
  store.set(singleton, { wood: "1" })

  // Update model & nested via instance

  store.set(wood, { branch: { id: "1", leaf: leaf }})
  store.set(wood, { branch: { id: "1", leaf: "1" }})
  store.set(singleton, { wood: { id: "1", branch: branch }})
  store.set(singleton, { wood: { id: "1", branch: "1" }})

  // Delete...

  // delete model via instance

  store.set(wood, null)
  store.set(singleton, null) // this is a cleansing of the model
}

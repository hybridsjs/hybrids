import { BranchFromMemory } from "../branch/branch-from-memory.store";
import { IWood } from "./wood.entity";
import { Model } from "/types";

export const WoodFromMemory: Model<IWood> = {
  id: true,
  branch: BranchFromMemory,
}
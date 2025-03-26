import { LeafFromMemory } from "../leaf/leaf-from-memory.store";
import { IBranch } from "./branch.entity";
import { Model } from "/types";

export const BranchFromMemory: Model<IBranch> = {
  id: true,
  leaf: LeafFromMemory,
}
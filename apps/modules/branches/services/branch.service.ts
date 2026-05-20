import { createBranch, deleteOrDeactivateBranch, getBranchById, listBranches, updateBranch } from "../repositories/branch.repository";
import { branchUpdateSchema, branchUpsertSchema, type BranchUpdateInput, type BranchUpsertInput } from "../validations/branch.validation";

export const branchService = {
  list() {
    return listBranches();
  },

  get(id: string) {
    return getBranchById(id);
  },

  create(input: BranchUpsertInput) {
    return createBranch(branchUpsertSchema.parse(input));
  },

  update(input: BranchUpdateInput) {
    return updateBranch(branchUpdateSchema.parse(input));
  },

  remove(id: string) {
    return deleteOrDeactivateBranch(id);
  }
};

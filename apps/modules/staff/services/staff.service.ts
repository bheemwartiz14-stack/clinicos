import { generateSecureToken, hashPassword } from "@mediclinic/auth";
import { createStaff, deleteStaffById, getStaffById, listStaff, updateStaff } from "../repositories/staff.repository";
import { staffCreateSchema, staffUpdateSchema, type StaffCreateInput, type StaffUpdateInput } from "../validations/staff.validation";

export const staffService = {
  list() {
    return listStaff();
  },

  get(id: string) {
    return getStaffById(id);
  },

  async create(input: StaffCreateInput) {
    const parsed = staffCreateSchema.parse(input);
    const password = parsed.password ?? generateSecureToken(12);
    const passwordHash = await hashPassword(password);

    return createStaff({
      ...parsed,
      passwordHash
    });
  },

  async update(input: StaffUpdateInput) {
    const parsed = staffUpdateSchema.parse(input);
    const passwordHash = parsed.password ? await hashPassword(parsed.password) : undefined;

    return updateStaff({
      ...parsed,
      passwordHash
    });
  },

  async delete(id: string) {
    return deleteStaffById(id);
  }
};

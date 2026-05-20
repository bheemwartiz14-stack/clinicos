import { createDepartment, getDepartmentById, listDepartmentHeads, listDepartments, updateDepartment } from "../repositories/department.repository";
import { departmentUpdateSchema, departmentUpsertSchema, type DepartmentUpdateInput, type DepartmentUpsertInput } from "../validations/department.validation";

export const departmentService = {
  list() {
    return listDepartments();
  },

  get(id: string) {
    return getDepartmentById(id);
  },

  create(input: DepartmentUpsertInput) {
    return createDepartment(departmentUpsertSchema.parse(input));
  },

  update(input: DepartmentUpdateInput) {
    return updateDepartment(departmentUpdateSchema.parse(input));
  },

  listHeads() {
    return listDepartmentHeads();
  }
};

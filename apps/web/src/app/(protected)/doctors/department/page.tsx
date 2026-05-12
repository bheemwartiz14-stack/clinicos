import { DepartmentsPageSearchParams, departmentsPageController, createDepartmentAction, updateDepartmentAction, deleteDepartmentAction } from "@/modules/departments";
import { DepartmentsView } from "@/modules/departments/views/departments.view";
import { connection } from "next/server";

type DepartmentsPageProps = {
  searchParams: Promise<DepartmentsPageSearchParams>;
};

export default async function DepartmentsPage({ searchParams }: DepartmentsPageProps) {
  await connection();
  const model = await departmentsPageController(searchParams);

  return (
    <DepartmentsView
      {...model}
      createAction={createDepartmentAction}
      updateAction={updateDepartmentAction}
      deleteAction={deleteDepartmentAction}
    />
  );
}

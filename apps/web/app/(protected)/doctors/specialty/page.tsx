import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { specialtyService } from "@modules/specialties/services/specialty.service";
import { SpecialtiesListView } from "@modules/specialties/views/specialties-list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Doctor Specialties | MediClinic Pro",
};

type SearchParams = {
  search?: string;
  departmentId?: string;
  status?: string;
  page?: string;
};

export default async function DoctorSpecialtiesPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  await requirePagePermission("specialties.view");
  const params = searchParams ? await searchParams : {};
  const page = Number(params.page || 1);
  const [specialtyResult, departments] = await Promise.all([
    specialtyService.listPaginated({
      search: params.search,
      departmentId: params.departmentId,
      status: params.status === "active" || params.status === "inactive" ? params.status : "",
      page: Number.isFinite(page) ? page : 1,
      perPage: 10,
    }),
    specialtyService.listDepartments(),
  ]);

  return (
    <SpecialtiesListView
      specialties={specialtyResult.data}
      departments={departments}
      total={specialtyResult.total}
      page={specialtyResult.page}
      perPage={specialtyResult.perPage}
      totalPages={specialtyResult.totalPages}
      search={params.search ?? ""}
      departmentId={params.departmentId ?? ""}
      status={params.status ?? ""}
    />
  );
}

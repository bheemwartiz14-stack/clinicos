import  { PatientsPageSearchParams } from "@/modules/patients";
import { deletePatientAction, patientsPageController } from "@/modules/patients";
import { PatientsView } from "@/modules/patients/views/patients.view";

type PatientsPageProps = {
  searchParams: Promise<PatientsPageSearchParams>;
};

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const model = await patientsPageController(searchParams);

  return (
    <PatientsView
      breadcrumb={model.breadcrumb}
      deleteAction={deletePatientAction}
      description={model.description}
      patients={model.patients}
      query={model.query}
      stats={model.stats}
      title={model.title}
    />
  );
}

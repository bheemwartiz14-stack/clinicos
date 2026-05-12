import { type DoctorsPageSearchParams, doctorsPageController } from "@/modules/doctors";
import { DoctorsView } from "@/modules/doctors/views/doctors.view";

type DoctorsPageProps = {
  searchParams: Promise<DoctorsPageSearchParams>;
};

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const model = await doctorsPageController(searchParams);

  return <DoctorsView {...model} />;
}

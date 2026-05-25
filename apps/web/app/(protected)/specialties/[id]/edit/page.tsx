import { redirect } from "next/navigation";

export default async function EditSpecialtyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/doctors/specialty/${id}/edit`);
}

import { redirect } from "next/navigation";
import type { Route } from "next";
export default function DoctorSlotsRedirectPage() {
  redirect("/doctors" as Route);
}

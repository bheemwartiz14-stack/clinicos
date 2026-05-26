import { redirect } from "next/navigation";
import type { Route } from "next";
export default function DoctorSchedulesRedirectPage() {
  redirect("/doctors" as Route);
}

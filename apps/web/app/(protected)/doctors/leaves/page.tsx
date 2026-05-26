import { redirect } from "next/navigation";
import type { Route } from "next";
export default function DoctorLeavesRedirectPage() {
  redirect("/doctors" as Route);
}

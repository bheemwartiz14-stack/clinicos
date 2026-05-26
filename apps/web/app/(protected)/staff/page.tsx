import { redirect } from "next/navigation";
import type { Route } from "next";
export default function StaffPage() {
  redirect("/settings/staff-manage" as Route);
}

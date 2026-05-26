import { redirect } from "next/navigation";
import type { Route } from "next";
export default function GeneratePage() {
  redirect("/payroll/payouts" as Route);
}

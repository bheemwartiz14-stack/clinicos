import { redirect } from "next/navigation";
import type { Route } from "next";
export default function BillingPage() {
  redirect("/billing/invoices" as Route);
}

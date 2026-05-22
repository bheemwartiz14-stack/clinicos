import { redirect } from "next/navigation";
import type { Route } from "next";

export const dynamic = "force-dynamic";

export default function PatienViewRedirect() {
  redirect("/patients" as Route);
}

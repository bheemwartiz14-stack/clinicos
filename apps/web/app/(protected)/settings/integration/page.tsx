import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { requirePageSession } from "@/lib/auth";
import GoogleIntegrationClient from "@modules/integrations/google-calendar/views/GoogleIntegrationClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "integrations | Clinicos",
};

const ALLOWED_ROLES = ["admin", "doctor"] as const;

export default async function IntegrationPage() {
  const session = await requirePageSession();

  if (!ALLOWED_ROLES.includes(session.role as typeof ALLOWED_ROLES[number])) {
    redirect("/403" as Route);
  }

  return <GoogleIntegrationClient userId={session.userId} />;
}

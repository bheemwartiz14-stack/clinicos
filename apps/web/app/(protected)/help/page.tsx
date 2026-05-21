import type { Metadata } from "next";
import { requirePageSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Help & Support | MediClinic Pro",
  description: "Support resources for MediClinic Pro users."
};

export default async function HelpSupportPage() {
  await requirePageSession();

  return (
    <section className="mx-auto grid max-w-4xl gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
        <p className="mt-2 text-sm text-muted-foreground">Quick support paths for profile, security, notification, and workflow questions.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Profile help", "Update identity, contact, branch, department, and professional information from Settings."],
          ["Security help", "Change your password, revoke device sessions, and review login history."],
          ["Operations help", "Contact your clinic administrator for role access, branch assignment, and workflow permissions."]
        ].map(([title, text]) => (
          <article key={title} className="rounded-xl border border-border bg-card p-5 shadow-lg shadow-foreground/5">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

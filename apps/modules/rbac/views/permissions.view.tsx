import Link from "next/link";
import { PermissionForm } from "../components/permission-form";
import { PermissionTable } from "../components/permission-table";
import type { RbacPermissionRecord } from "../types/rbac.types";

export function PermissionsView({ permissions }: { permissions: RbacPermissionRecord[] }) {
  return (
    <div className="grid gap-6">
      <section className="rounded-2xl border border-border bg-card/80 p-6 shadow-lg shadow-foreground/5 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary">RBAC Registry</p>
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-foreground sm:text-3xl">Permission management</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Permission IDs define the secure contract for protected routes, server actions, and filtered navigation.
        </p>
        <Link href="/rbac/roles" className="mt-5 inline-flex rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary">
          Back to roles
        </Link>
      </section>
      <PermissionForm />
      <PermissionTable permissions={permissions} />
    </div>
  );
}

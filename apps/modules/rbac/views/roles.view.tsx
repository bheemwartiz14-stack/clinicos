import Link from "next/link";
import { PermissionTable } from "../components/permission-table";
import { RoleForm } from "../components/role-form";
import { RolePermissionMatrix } from "../components/role-permission-matrix";
import type { RbacOverview } from "../types/rbac.types";

export function RolesView({ overview }: { overview: RbacOverview }) {
  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-2xl border border-border bg-card/80 p-6 shadow-lg shadow-foreground/5 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">RBAC Control Center</p>
            <h1 className="mt-2 text-2xl font-bold tracking-normal text-foreground sm:text-3xl">Roles and permissions</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Manage clinic access policy from the same RBAC registry used by secure login, protected routes, guarded server actions, and sidebar permission filtering.
            </p>
          </div>
          <Link href="/rbac/permissions" className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary">
            Permission registry
          </Link>
        </div>
      </section>

      <RoleForm permissions={overview.permissions} />
      <RolePermissionMatrix matrix={overview.matrix} permissions={overview.permissions} />
      <PermissionTable permissions={overview.permissions.slice(0, 8)} />
    </div>
  );
}

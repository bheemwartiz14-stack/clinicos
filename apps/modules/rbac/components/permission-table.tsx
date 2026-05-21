import { deletePermissionAction } from "../actions/rbac.actions";
import type { RbacPermissionRecord } from "../types/rbac.types";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";

export function PermissionTable({ permissions }: { permissions: RbacPermissionRecord[] }) {
  return (
    <section className="rounded-xl border border-border bg-card/80 shadow-lg shadow-foreground/5 backdrop-blur">
      <div className="border-b border-border p-5">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary">Permissions</p>
        <h2 className="mt-1 text-xl font-semibold text-foreground">Secure action registry</h2>
        <p className="mt-2 text-sm text-muted-foreground">These keys power route protection, server action guards, and dashboard sidebar filtering.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-normal text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">Permission</th>
              <th className="px-5 py-3 font-semibold">Module</th>
              <th className="px-5 py-3 font-semibold">Action</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {permissions.map((permission) => (
              <tr key={permission.id} className="transition hover:bg-muted/40">
                <td className="px-5 py-3 font-mono text-xs font-semibold text-foreground">{permission.name}</td>
                <td className="px-5 py-3 capitalize text-muted-foreground">{permission.module}</td>
                <td className="px-5 py-3 capitalize text-muted-foreground">{permission.action.replaceAll("_", " ")}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">System</span>
                </td>
                <td className="px-5 py-3 text-right">
                  <ConfirmActionDialog
                    action={deletePermissionAction}
                    fields={{ id: permission.id }}
                    triggerLabel="Delete"
                    confirmLabel="Delete permission"
                    title={`Delete ${permission.name}?`}
                    description="This is protected by RBAC and system permissions cannot be removed unless the shared secure RBAC registry is changed."
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

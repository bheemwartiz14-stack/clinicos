import { CheckCircle2, ShieldCheck, UsersRound } from "lucide-react";

import { accessControlPageController } from "@/modules/access-control";

function formatPermission(permission: { action: string; module: string; name: string }) {
  return permission.name || `${permission.module}.${permission.action}`;
}

function countRolePermissions(
  roleId: string,
  rolePermissions: Array<{ permissionId: string; roleId: string }>,
) {
  return rolePermissions.filter((item) => item.roleId === roleId).length;
}

export default async function RolePermissionsPage() {
  const data = await accessControlPageController();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Role Permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage role access for clinic admins, doctors, reception, and billing teams.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Roles", String(data.roles.length), UsersRound],
          ["Permissions", String(data.permissions.length), ShieldCheck],
          ["Active rules", String(data.rolePermissions.length), CheckCircle2],
        ].map(([label, value, Icon]) => (
          <div key={label as string} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label as string}</p>
              <Icon className="size-5 text-primary" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-foreground">{value as string}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b p-4">
            <h2 className="font-semibold text-foreground">Clinic Roles</h2>
          </div>

          <div className="divide-y">
            {data.roles.length ? (
              data.roles.map((role) => {
                const count = countRolePermissions(role.id, data.rolePermissions);

                return (
                  <div key={role.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-medium text-foreground">{role.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {role.description || "No description added"}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {count} {count === 1 ? "permission" : "permissions"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-sm text-muted-foreground">No roles found.</div>
            )}
          </div>
        </div>

        <aside className="rounded-lg border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Permission Catalog</h2>

          <div className="mt-4 space-y-3">
            {data.permissions.length ? (
              data.permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"
                >
                  <CheckCircle2 className="mt-0.5 size-4 text-primary" />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">
                      {formatPermission(permission)}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {permission.module}.{permission.action}
                    </span>
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                No permissions found.
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b p-4">
          <h2 className="font-semibold text-foreground">Role Permission Matrix</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current access rules from the access-control module.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Permission</th>
                {data.roles.map((role) => (
                  <th key={role.id} className="px-4 py-3 font-medium">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.permissions.length ? (
                data.permissions.map((permission) => (
                  <tr key={permission.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{formatPermission(permission)}</p>
                      <p className="text-xs text-muted-foreground">
                        {permission.module}.{permission.action}
                      </p>
                    </td>

                    {data.roles.map((role) => {
                      const allowed = data.rolePermissions.some(
                        (item) => item.roleId === role.id && item.permissionId === permission.id,
                      );

                      return (
                        <td key={role.id} className="px-4 py-3">
                          <span
                            className={
                              allowed
                                ? "rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600"
                                : "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                            }
                          >
                            {allowed ? "Allowed" : "Denied"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-sm text-muted-foreground"
                    colSpan={Math.max(data.roles.length + 1, 1)}
                  >
                    No permissions available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { type Permission, rolePermissions, roles } from "@mediclinicpro/types";
import { Badge } from "@mediclinicpro/ui/components/badge";
import { Check, Minus } from "lucide-react";
import { redirect } from "next/navigation";
import { Fragment } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentUser } from "@/lib/server/auth";

const permissionGroups: Array<{
  title: string;
  permissions: Array<{ key: Permission; label: string }>;
}> = [
  {
    title: "Workspace",
    permissions: [
      { key: "dashboard.read", label: "Dashboard access" },
      { key: "settings.manage", label: "Clinic settings" },
      { key: "roles.manage", label: "Role permissions" },
    ],
  },
  {
    title: "Clinical",
    permissions: [
      { key: "patients.read", label: "View patients" },
      { key: "patients.write", label: "Manage patients" },
      { key: "appointments.read", label: "View appointments" },
      { key: "appointments.write", label: "Manage appointments" },
      { key: "prescriptions.write", label: "Write prescriptions" },
      { key: "ai_notes.read", label: "AI notes" },
    ],
  },
  {
    title: "Operations",
    permissions: [
      { key: "billing.read", label: "View billing" },
      { key: "billing.write", label: "Manage billing" },
      { key: "inventory.read", label: "Inventory access" },
    ],
  },
];

export default async function RolePermissionsPage() {
  const user = await getCurrentUser();

  if (!user || !rolePermissions[user.role].includes("roles.manage")) {
    redirect("/dashboard");
  }

  return (
    <DashboardShell
      activeHref="/dashboard/role-permissions"
      title="Role Permissions"
      breadcrumb={["Workspace", "Admin", "Role Permissions"]}
    >
      <section className="grid gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Permission Matrix</h2>
              <p className="mt-1 text-sm text-slate-500">
                Sidebar visibility and protected API access use the same role map.
              </p>
            </div>
            <Badge className="capitalize">{user.role}</Badge>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="w-56 border-b border-slate-200 px-4 py-3 font-medium">
                    Permission
                  </th>
                  {roles.map((role) => (
                    <th
                      className="border-b border-slate-200 px-4 py-3 font-medium capitalize"
                      key={role}
                    >
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionGroups.map((group) => (
                  <Fragment key={group.title}>
                    <tr>
                      <td
                        className="bg-slate-50 px-4 py-2 text-xs font-semibold uppercase text-slate-500"
                        colSpan={roles.length + 1}
                      >
                        {group.title}
                      </td>
                    </tr>
                    {group.permissions.map((permission) => (
                      <tr className="border-t border-slate-100" key={permission.key}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{permission.label}</p>
                          <p className="font-mono text-xs text-slate-500">{permission.key}</p>
                        </td>
                        {roles.map((role) => {
                          const isAllowed = rolePermissions[role].includes(permission.key);

                          return (
                            <td className="px-4 py-3" key={role}>
                              <span
                                className={[
                                  "inline-flex h-7 w-7 items-center justify-center rounded-md",
                                  isAllowed
                                    ? "bg-teal-50 text-teal-700"
                                    : "bg-slate-100 text-slate-400",
                                ].join(" ")}
                              >
                                {isAllowed ? <Check size={16} /> : <Minus size={16} />}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}

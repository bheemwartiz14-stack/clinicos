import { CheckCircle2, Edit, KeyRound, ShieldCheck, Trash2, Users } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
  ActionState,
  RoleCardItem,
  RolesPermissionsPageModel,
} from "../roles-permissions.types";
import { CreateRoleDialog, RolesPermissionsToast } from "./create-role-dialog";

type CreateRoleAction = (formData: FormData) => Promise<ActionState>;

const roleColorClasses = [
  "border-rose-500 bg-rose-500 text-white",
  "border-blue-500 bg-blue-500 text-white",
  "border-emerald-600 bg-emerald-600 text-white",
  "border-amber-500 bg-amber-500 text-white",
  "border-violet-600 bg-violet-600 text-white",
  "border-cyan-600 bg-cyan-600 text-white",
];

function formatModuleName(module: string) {
  return module
    .split(/[-_.\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatActionName(action: string) {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

function RoleCard({
  colorClassName,
  role,
  totalPermissions,
}: {
  colorClassName: string;
  role: RoleCardItem;
  totalPermissions: number;
}) {
  const visiblePermissions = role.isFullAccess
    ? ["All Permissions"]
    : role.permissions.slice(0, 3).map((permission) => formatModuleName(permission.name));
  const hiddenPermissionsCount = role.isFullAccess
    ? 0
    : Math.max(role.permissions.length - visiblePermissions.length, 0);

  return (
    <article className={`overflow-hidden rounded-lg border shadow-sm ${colorClassName}`}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-14 place-items-center rounded-lg bg-white/20">
            <ShieldCheck className="size-6" />
          </span>
          <div className="flex flex-wrap justify-end gap-2">
            {role.isDefault ? (
              <Badge className="border-white/25 bg-white/20 text-white">Default</Badge>
            ) : null}
            {role.isActive ? (
              <Badge className="border-white/25 bg-white/20 text-white">Active</Badge>
            ) : (
              <Badge variant="secondary">Inactive</Badge>
            )}
            {role.isFullAccess ? (
              <Badge className="border-white/25 bg-white/20 text-white">Full</Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-card/90 p-6 text-card-foreground">
        <h2 className="text-xl font-semibold tracking-tight">{role.label}</h2>
        <p className="mt-2 min-h-10 text-muted-foreground text-sm">
          {role.description ?? "No role description provided."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-5 text-muted-foreground text-sm">
          <span className="inline-flex items-center gap-2">
            <Users className="size-4 text-primary" />
            {role.userCount} Users
          </span>
          <span className="inline-flex items-center gap-2">
            <KeyRound className="size-4 text-primary" />
            {role.permissions.length}/{totalPermissions} Permissions
          </span>
        </div>

        <Separator className="my-5" />

        <div>
          <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
            Key Permissions:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {visiblePermissions.length > 0 ? (
              visiblePermissions.map((permission) => (
                <Badge key={permission} variant="secondary" className="rounded-md px-3 py-1">
                  {permission}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="rounded-md px-3 py-1">
                No permissions
              </Badge>
            )}
            {hiddenPermissionsCount > 0 ? (
              <Badge className="rounded-md px-3 py-1">+{hiddenPermissionsCount} more</Badge>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2">
            <Edit className="size-4" />
            Edit
          </Button>
          <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}

export function RolesPermissionsView({
  breadcrumb,
  createRoleAction,
  description,
  permissionModules,
  roles,
  stats,
  title,
}: RolesPermissionsPageModel & {
  createRoleAction: CreateRoleAction;
}) {
  return (
    <DashboardShell activeHref="/setting/roles-permissions" breadcrumb={breadcrumb} title={title}>
      <RolesPermissionsToast />
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-3xl text-muted-foreground text-sm">{description}</p>
          <CreateRoleDialog action={createRoleAction} permissionModules={permissionModules} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Total roles", stats.totalRoles],
            ["Active roles", stats.activeRoles],
            ["Permissions", stats.totalPermissions],
            ["Assignments", stats.assignedPermissions],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border bg-card p-4 shadow-sm">
              <p className="text-muted-foreground text-sm">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          {roles.map((role, index) => (
            <RoleCard
              key={role.id}
              role={role}
              totalPermissions={stats.totalPermissions}
              colorClassName={roleColorClasses[index % roleColorClasses.length]}
            />
          ))}
        </section>

        <section className="rounded-lg border bg-card shadow-sm">
          <div className="border-b p-5">
            <h2 className="font-semibold text-foreground">Permissions by Module</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Review each permission flag grouped by functional module.
            </p>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {permissionModules.map((module) => (
              <div key={module.module} className="rounded-lg border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{formatModuleName(module.module)}</h3>
                  <Badge variant="outline">{module.permissions.length} flags</Badge>
                </div>
                <div className="mt-4 grid gap-2">
                  {module.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between gap-3 rounded-md border bg-card px-3 py-2"
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {formatActionName(permission.action)}
                        </span>
                        <span className="block text-muted-foreground text-xs">
                          {permission.name}
                        </span>
                      </span>
                      {permission.isActive ? (
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      ) : (
                        <Badge variant="secondary">Off</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

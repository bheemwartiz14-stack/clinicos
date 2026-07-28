import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { roles, rolePermissions } from "@mediclinic/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Key, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RBAC Roles | MediClinic Pro",
  description: "Manage role-based access control for secure clinic users."
};

const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  doctor: Users,
  nurse: Key,
  receptionist: Lock,
  lab_technician: Lock,
  accountant: Lock,
};

function getRoleIcon(role: string) {
  return ROLE_ICONS[role] ?? Shield;
}

export default async function RbacRolesPage() {
  await requirePagePermission("rbac.manage");

  const totalPermissions = roles.reduce((acc, r) => acc + (rolePermissions[r]?.length ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 translate-y-6 rounded-full bg-primary/5" />
        <div className="relative">
          <Badge variant="outline" className="mb-3 border-primary/20 bg-primary/5 text-primary">
            Access Control
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">RBAC Roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Role-based access control for secure clinic user management.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
              <Shield className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Total Roles</p>
              <p className="text-2xl font-bold tabular-nums">{roles.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-600">
              <Key className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Total Permissions</p>
              <p className="text-2xl font-bold tabular-nums">{totalPermissions}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-600">
              <Users className="h-6 w-6 text-white" />
            </span>
            <div>
              <p className="truncate text-sm text-muted-foreground">Avg per Role</p>
              <p className="text-2xl font-bold tabular-nums">{Math.round(totalPermissions / roles.length)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => {
          const Icon = getRoleIcon(role);
          const perms = rolePermissions[role] ?? [];
          return (
            <Card key={role} className="border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <CardHeader className="border-b bg-muted/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/20">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle className="text-base capitalize">{role.replace(/_/g, " ")}</CardTitle>
                      <CardDescription>{perms.length} permission{perms.length !== 1 ? "s" : ""} assigned</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-mono text-[10px]">
                    {role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {perms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No permissions assigned.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {perms.map((permission) => (
                      <Badge key={permission} variant="secondary" className="bg-muted/50 text-xs font-normal">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

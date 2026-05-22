import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { roles, rolePermissions } from "@mediclinic/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RBAC Roles | MediClinic Pro",
  description: "Manage role-based access control for secure clinic users."
};

export default async function RbacRolesPage() {
  await requirePagePermission("rbac.manage");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Roles</h1>
        <p className="text-sm text-muted-foreground">Role-based access control for clinic users.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <Card key={role} className="rounded-lg">
            <CardHeader>
              <CardTitle className="capitalize">{role}</CardTitle>
              <CardDescription>{rolePermissions[role]?.length ?? 0} permissions assigned</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {(rolePermissions[role] ?? []).map((permission) => (
                <Badge key={permission} variant="outline">{permission}</Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

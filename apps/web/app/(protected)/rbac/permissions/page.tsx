import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { permissionsData } from "@mediclinic/db/data/permissions.data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RBAC Permissions | MediClinic Pro",
  description: "Manage protected permission keys for secure clinic access."
};

export default async function RbacPermissionsPage() {
  await requirePagePermission("rbac.manage");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Permissions</h1>
        <p className="text-sm text-muted-foreground">Protected permission keys used by routes and navigation.</p>
      </div>
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Permission Registry</CardTitle>
          <CardDescription>{permissionsData.length} permission keys configured.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {permissionsData.map((permission) => (
            <div key={permission.code} className="rounded-lg border p-3">
              <Badge variant="outline">{permission.code}</Badge>
              <p className="mt-2 text-sm font-medium">{permission.description}</p>
              <p className="text-xs text-muted-foreground">{permission.module} · {permission.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

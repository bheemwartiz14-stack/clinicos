import Link from "next/link";
import { requirePagePermission } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function RbacIndexPage() {
  await requirePagePermission("rbac.manage");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Access Control</h1>
        <p className="text-sm text-muted-foreground">Review roles and permission keys used by secure routes.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Admin, Doctor, Receptionist, and Accountant access.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link href="/rbac/roles">Open Roles</Link></Button>
          </CardContent>
        </Card>
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Permission registry used by RBAC guards.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link href="/rbac/permissions">Open Permissions</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

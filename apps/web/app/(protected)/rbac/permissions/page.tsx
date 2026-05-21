import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { rbacController } from "@modules/rbac/controllers/rbac.controller";
import { PermissionsView } from "@modules/rbac/views/permissions.view";

export const metadata: Metadata = {
  title: "RBAC Permissions | MediClinic Pro",
  description: "Manage protected permission keys for secure clinic access."
};

export default async function RbacPermissionsPage() {
  await requirePagePermission("rbac.manage");
  const permissions = rbacController.permissions();

  return <PermissionsView permissions={permissions} />;
}

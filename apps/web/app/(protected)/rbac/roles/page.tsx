import type { Metadata } from "next";
import { requirePagePermission } from "@/lib/auth";
import { rbacController } from "@modules/rbac/controllers/rbac.controller";
import { RolesView } from "@modules/rbac/views/roles.view";

export const metadata: Metadata = {
  title: "RBAC Roles | MediClinic Pro",
  description: "Manage role-based access control for secure clinic users."
};

export default async function RbacRolesPage() {
  await requirePagePermission("rbac.manage");
  const overview = rbacController.overview();

  return <RolesView overview={overview} />;
}

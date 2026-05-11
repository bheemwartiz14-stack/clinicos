import {
  createRoleAction,
  rolesPermissionsPageController,
} from "@/modules/setting/roles-permissions";
import { RolesPermissionsView } from "@/modules/setting/roles-permissions/views/roles-permissions.view";

export default async function RolesPermissionsPage() {
  const pageData = await rolesPermissionsPageController();

  return <RolesPermissionsView {...pageData} createRoleAction={createRoleAction} />;
}
